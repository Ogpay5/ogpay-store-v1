import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const paymentStatus = body.payment_status;
    const orderId = body.order_id;

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing order id" },
        { status: 400 }
      );
    }

    if (
      paymentStatus !== "finished" &&
      paymentStatus !== "confirmed"
    ) {
      return NextResponse.json({
        received: true,
      });
    }

    const topupId = orderId.replace("topup-", "");

    const { data: topup } = await supabase
      .from("topups")
      .select("*")
      .eq("id", topupId)
      .single();

    if (!topup) {
      return NextResponse.json(
        { error: "Topup not found" },
        { status: 404 }
      );
    }

    if (topup.payment_status === "completed") {
      return NextResponse.json({
        received: true,
      });
    }

    const amount = Number(topup.amount);

    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", topup.user_id)
      .single();

    const currentBalance = Number(profile?.balance || 0);

    await supabase
      .from("profiles")
      .update({
        balance: currentBalance + amount,
      })
      .eq("id", topup.user_id);

    await supabase
      .from("wallet_transactions")
      .insert({
        user_id: topup.user_id,
        type: "topup",
        amount,
        note: "Crypto wallet topup",
      });

    await supabase
      .from("topups")
      .update({
        payment_status: "completed",
        payment_id: body.payment_id?.toString() || null,
      })
      .eq("id", topup.id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook server error" },
      { status: 500 }
    );
  }
}
