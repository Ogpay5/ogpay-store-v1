import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const client = (token: string) =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: token,
        },
      },
    }
  );

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userClient = client(authHeader);

    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    const { data: cartItems } = await admin
      .from("cart_items")
      .select(`
        id,
        quantity_packs,
        product:products (
          id,
          title,
          price_per_pack,
          lines_per_pack,
          stock_count
        )
      `)
      .eq("user_id", user.id);

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    let total = 0;

    for (const item of cartItems as any[]) {
      total +=
        Number(item.product.price_per_pack) *
        Number(item.quantity_packs);
    }

    const balance = Number(profile?.balance || 0);

    if (balance < total) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const deliveredLines: string[] = [];

    for (const item of cartItems as any[]) {
      const needed =
        Number(item.product.lines_per_pack) *
        Number(item.quantity_packs);

      const { data: lines } = await admin
        .from("product_lines")
        .select("id, content")
        .eq("product_id", item.product.id)
        .eq("used", false)
        .limit(needed);

      if (!lines || lines.length < needed) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product.title}` },
          { status: 400 }
        );
      }

      const ids = lines.map((line) => line.id);

      await admin
        .from("product_lines")
        .update({
          used: true,
          used_by: user.id,
        })
        .in("id", ids);

      await admin
        .from("products")
        .update({
          stock_count:
            Number(item.product.stock_count) - needed,
        })
        .eq("id", item.product.id);

      deliveredLines.push(
        ...lines.map((line) => line.content)
      );
    }

    const newBalance = balance - total;

    await admin
      .from("profiles")
      .update({
        balance: newBalance,
      })
      .eq("id", user.id);

    await admin
      .from("wallet_transactions")
      .insert({
        user_id: user.id,
        type: "purchase",
        amount: -total,
        note: "Wallet checkout purchase",
      });

    const { data: order } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: total,
        status: "completed",
      })
      .select()
      .single();

    if (order) {
      await admin
        .from("order_deliveries")
        .insert({
          order_id: order.id,
          delivered_content: deliveredLines.join("\n"),
        });
    }

    await admin
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      total,
      delivered: deliveredLines.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Wallet checkout failed" },
      { status: 500 }
    );
  }
}
