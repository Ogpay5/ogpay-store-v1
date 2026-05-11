import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function userClient(token: string) {
  return createClient(
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
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = userClient(authHeader);

    const { data: userData } = await auth.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userData.user.id;

    const { data: profile } = await admin
      .from("profiles")
      .select("balance")
      .eq("id", userId)
      .single();

    const balance = Number(profile?.balance || 0);

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
      .eq("user_id", userId);

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    let total = 0;

    for (const item of cartItems as any[]) {
      total += Number(item.product.price_per_pack) * Number(item.quantity_packs);
    }

    if (balance < total) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const orderCode =
      "OG-" +
      crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: userId,
        total_price: total,
        paid: true,
        delivered: true,
        status: "delivered",
        order_code: orderCode,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: orderError?.message || "Could not create order" },
        { status: 400 }
      );
    }

    let totalDelivered = 0;
    const allDeliveredParts: string[] = [];

    for (const item of cartItems as any[]) {
      const product = item.product;
      const quantityPacks = Number(item.quantity_packs);
      const linesPerPack = Number(product.lines_per_pack);
      const needed = quantityPacks * linesPerPack;

      const { data: lines } = await admin
        .from("product_lines")
        .select("id, content")
        .eq("product_id", product.id)
        .eq("sold", false)
        .limit(needed);

      if (!lines || lines.length < needed) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.title}` },
          { status: 400 }
        );
      }

      const deliveredContent = lines.map((line) => line.content).join("\n");
      const lineIds = lines.map((line) => line.id);

      await admin
        .from("product_lines")
        .update({
          sold: true,
          sold_at: new Date().toISOString(),
        })
        .in("id", lineIds);

      const newStock = Number(product.stock_count) - needed;

      await admin
        .from("products")
        .update({
          stock_count: newStock,
          active: newStock >= linesPerPack,
        })
        .eq("id", product.id);

      await admin.from("order_items").insert({
        order_id: order.id,
        product_id: product.id,
        product_title: product.title,
        quantity_packs: quantityPacks,
        lines_per_pack: linesPerPack,
        total_lines: needed,
        delivered_content: deliveredContent,
      });

      totalDelivered += needed;

      allDeliveredParts.push(
        `PRODUCT: ${product.title}\n` +
          `PACKS: ${quantityPacks}\n` +
          `LINES: ${needed}\n\n` +
          deliveredContent
      );
    }

    await admin
      .from("profiles")
      .update({
        balance: balance - total,
      })
      .eq("id", userId);

    await admin.from("wallet_transactions").insert({
      user_id: userId,
      type: "purchase",
      amount: -total,
      note: `Purchase ${orderCode}`,
    });

    await admin
      .from("orders")
      .update({
        delivered_content: allDeliveredParts.join("\n\n--------------------\n\n"),
      })
      .eq("id", order.id);

    await admin.from("cart_items").delete().eq("user_id", userId);

    return NextResponse.json({
      success: true,
      orderCode,
      total,
      delivered: totalDelivered,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Wallet checkout failed" },
      { status: 500 }
    );
  }
}
