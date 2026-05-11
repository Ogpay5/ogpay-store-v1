import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const body = await request.json();

  console.log("NOWPayments webhook:", body);

  const paymentStatus = body.payment_status;
  const orderId = body.order_id;

  if (!orderId) {
    return NextResponse.json(
      { error: "order_id faltante" },
      { status: 400 }
    );
  }

  if (!["finished", "confirmed", "sending"].includes(paymentStatus)) {
    return NextResponse.json({
      success: true,
      ignored: paymentStatus,
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json(
      { error: "Orden no encontrada" },
      { status: 404 }
    );
  }

  if (order.delivered) {
    return NextResponse.json({
      success: true,
      alreadyDelivered: true,
    });
  }

  const { data: cartItems } = await supabase
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
    .eq("user_id", order.user_id);

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json(
      { error: "Carrito vacío" },
      { status: 400 }
    );
  }

  let deliveredContent = "";

  for (const item of cartItems as any[]) {
    const product = item.product;

    const linesNeeded =
      item.quantity_packs *
      product.lines_per_pack;

    const { data: lines } = await supabase
      .from("product_lines")
      .select("id, content")
      .eq("product_id", product.id)
      .eq("sold", false)
      .limit(linesNeeded);

    if (!lines || lines.length < linesNeeded) {
      return NextResponse.json(
        {
          error: `Stock insuficiente para ${product.title}`,
        },
        { status: 400 }
      );
    }

    const lineIds = lines.map((line) => line.id);

    deliveredContent +=
      `PRODUCTO: ${product.title}\n`;

    deliveredContent +=
      lines.map((line) => line.content).join("\n");

    deliveredContent += "\n\n";

    await supabase
      .from("product_lines")
      .update({
        sold: true,
        sold_at: new Date().toISOString(),
      })
      .in("id", lineIds);

    const newStock =
      product.stock_count - linesNeeded;

    await supabase
      .from("products")
      .update({
        stock_count: newStock,
        active:
          newStock >= product.lines_per_pack,
      })
      .eq("id", product.id);
  }

  await supabase
    .from("orders")
    .update({
      paid: true,
      delivered: true,
      status: "delivered",
      delivered_content: deliveredContent,
      payment_id: String(body.payment_id || ""),
    })
    .eq("id", orderId);

  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", order.user_id);

  return NextResponse.json({
    success: true,
    delivered: true,
  });
}
