import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function authClient(authHeader: string) {
  return createClient(
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
}

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) return null;

  const auth = authClient(authHeader);
  const admin = serviceClient();

  const { data: userData } = await auth.auth.getUser();

  if (!userData.user) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("role, approved")
    .eq("id", userData.user.id)
    .single();

  if (!profile?.approved || profile.role !== "admin") {
    return null;
  }

  return userData.user;
}

export async function GET(request: Request) {
  const adminUser = await verifyAdmin(request);

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = serviceClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,approved,role,balance,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ users: data || [] });
}

export async function PATCH(request: Request) {
  const adminUser = await verifyAdmin(request);

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const userId = body.userId;
  const action = body.action;
  const amount = Number(body.amount || 0);

  if (!userId || !action) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const supabase = serviceClient();

  const { data: user } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (action === "approve") {
    await supabase
      .from("profiles")
      .update({ approved: true })
      .eq("id", userId);
  }

  if (action === "block") {
    await supabase
      .from("profiles")
      .update({ approved: false })
      .eq("id", userId);
  }

  if (action === "add_balance") {
    const newBalance = Number(user.balance || 0) + amount;

    await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", userId);

    await supabase
      .from("wallet_transactions")
      .insert({
        user_id: userId,
        type: "admin_credit",
        amount,
        note: "Balance added by admin",
      });
  }

  if (action === "remove_balance") {
    const newBalance = Math.max(0, Number(user.balance || 0) - amount);

    await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", userId);

    await supabase
      .from("wallet_transactions")
      .insert({
        user_id: userId,
        type: "admin_debit",
        amount,
        note: "Balance removed by admin",
      });
  }

  return NextResponse.json({ success: true });
}
