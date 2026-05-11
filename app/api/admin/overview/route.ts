import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function authClient(token: string) {
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

async function verifyAdmin(request: Request) {
  const token = request.headers.get("authorization");
  if (!token) return false;

  const auth = authClient(token);
  const admin = serviceClient();

  const { data: userData } = await auth.auth.getUser();
  if (!userData.user) return false;

  const { data: profile } = await admin
    .from("profiles")
    .select("role, approved")
    .eq("id", userData.user.id)
    .single();

  return profile?.role === "admin" && profile?.approved === true;
}

export async function GET(request: Request) {
  const isAdmin = await verifyAdmin(request);

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = serviceClient();

  const { data: orders } = await admin
    .from("orders")
    .select(`
      id,
      order_code,
      user_id,
      total_price,
      status,
      created_at,
      profiles:user_id (
        email
      ),
      order_items (
        id,
        product_title,
        quantity_packs,
        lines_per_pack,
        total_lines,
        delivered_content,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  const { data: users } = await admin
    .from("profiles")
    .select("id,balance,approved,created_at");

  const { data: products } = await admin
    .from("products")
    .select("id,stock_count,active");

  const { data: topups } = await admin
    .from("topups")
    .select("id,amount,payment_status,created_at");

  const totalRevenue =
    orders?.reduce((sum: number, order: any) => {
      return sum + Number(order.total_price || 0);
    }, 0) || 0;

  const totalTopups =
    topups?.reduce((sum: number, topup: any) => {
      if (topup.payment_status === "completed") {
        return sum + Number(topup.amount || 0);
      }
      return sum;
    }, 0) || 0;

  const totalBalance =
    users?.reduce((sum: number, user: any) => {
      return sum + Number(user.balance || 0);
    }, 0) || 0;

  const totalStock =
    products?.reduce((sum: number, product: any) => {
      return sum + Number(product.stock_count || 0);
    }, 0) || 0;

  return NextResponse.json({
    orders: orders || [],
    analytics: {
      totalRevenue,
      totalTopups,
      totalBalance,
      totalUsers: users?.length || 0,
      approvedUsers: users?.filter((u: any) => u.approved).length || 0,
      totalProducts: products?.length || 0,
      activeProducts: products?.filter((p: any) => p.active).length || 0,
      totalStock,
      totalOrders: orders?.length || 0,
    },
  });
}
