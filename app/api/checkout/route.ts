import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  const { data: cartItems, error: cartError } = await supabase
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
    .eq("user_id", userData.user.id);

  if (cartError) {
    return NextResponse.json({ error: cartError.message }, { status: 400 });
  }

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
  }

  let deliveredContent = "";
  let totalPrice = 0;

  for (const item of cartItems as any[]) {
    const product = item.product;
    const linesNeeded = item.quantity_packs * product.lines_per_pack;

    if (product.stock_count < linesNeeded) {
      return NextResponse.json(
        { error: `Stock insuficiente para ${product.title}` },
        { status: 400 }
      );
    }

    const { data: lines, error: linesError } = await supabase
      .from("product_lines")
      .select("id, content")
      .eq("product_id", product.id)
      .eq("sold", false)
      .limit(linesNeeded);

    if (linesError || !lines || lines.length < linesNeeded) {
      return NextResponse.json(
        { error: `No hay suficientes líneas para ${product.title}` },
        { status: 400 }
      );
    }

    const lineIds = lines.map((line) => line.id);

    deliveredContent += `PRODUCTO: ${product.title}\n`;
    deliveredContent += lines.map((line) => line.content).join("\n");
    deliveredContent += "\n\n";

    totalPrice += item.quantity_packs * product.price_per_pack;

    const { error: updateLinesError } = await supabase
      .from("product_lines")
      .update({
        sold: true,
        sold_at: new Date().toISOString(),
      })
      .in("id", lineIds);

    if (updateLinesError) {
      return NextResponse.json({ error: updateLinesError.message }, { status: 400 });
    }

    const newStock = product.stock_count - linesNeeded;

    const { error: productError } = await supabase
      .from("products")
      .update({
        stock_count: newStock,
        active: newStock >= product.lines_per_pack,
      })
      .eq("id", product.id);

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 400 });
    }
  }

  const { error: orderError } = await supabase.from("orders").insert({
    user_id: userData.user.id,
    total_price: totalPrice,
    paid: true,
    delivered: true,
    status: "delivered",
    delivered_content: deliveredContent,
  });

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 400 });
  }

  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userData.user.id);

  return NextResponse.json({
    success: true,
    deliveredContent,
    totalPrice,
  });
}
