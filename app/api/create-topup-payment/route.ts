import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const amount = Number(body.amount);

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: "Invalid amount" },
      { status: 400 }
    );
  }

  const topupId = crypto.randomUUID();

  const response = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: "usd",
      order_id: `topup-${topupId}`,
      order_description: "OGPAYTRUE Wallet Topup",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wallet?topup=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wallet?topup=cancel`,
      ipn_callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/nowpayments-webhook`,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.message || "Failed to create invoice" },
      { status: 400 }
    );
  }

  return NextResponse.json(data);
}
