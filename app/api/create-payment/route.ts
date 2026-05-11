import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const { amount, userId } = await request.json();

  if (!amount || !userId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: authHeader || "",
        },
      },
    }
  );

  const orderId = crypto.randomUUID();

  const response = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: "usd",
      order_id: orderId,
      order_description: "Compra de producto digital",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart?payment=cancel`,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.message || "Error creando pago" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("orders").insert({
    id: orderId,
    user_id: userId,
    total_price: amount,
    paid: false,
    delivered: false,
    status: "pending",
    invoice_id: String(data.id || ""),
    invoice_url: data.invoice_url,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    invoice_url: data.invoice_url,
    order_id: orderId,
  });
}
