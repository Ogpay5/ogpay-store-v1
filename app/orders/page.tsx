"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Order = {
  id: string;
  order_code: string | null;
  total_price: number | null;
    status: string | null;
  delivered_content: string | null;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("id,order_code,total_price,status,delivered_content,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setOrders((data as Order[]) || []);
    setLoading(false);
  }

  function downloadTxt(order: Order) {
    if (!order.delivered_content) return;

    const blob = new Blob([order.delivered_content], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${order.order_code || "OGPAYTRUE-" + order.id.slice(0, 8)}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="uppercase tracking-[0.35em] text-zinc-500">
          Loading...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-5xl font-black tracking-[0.14em]">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
              OG
            </span>
            <span> ORDERS</span>
          </h1>

          <a
            href="/dashboard"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:bg-white/5"
          >
            Dashboard
          </a>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              Order History
            </h2>

            <p className="text-zinc-500">
              {orders.length} orders
            </p>
          </div>

          <div className="space-y-5">
            {orders.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-zinc-500">
                  No orders yet.
                </p>
              </div>
            )}

            {orders.map((order) => {
              const total = Number(order.total_price ?? 0);
              const code = order.order_code || `OG-${order.id.slice(0, 8).toUpperCase()}`;
              const hasDelivery = Boolean(order.delivered_content && order.delivered_content.trim().length > 0);

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
                        {code}
                      </p>

                      <h3 className="mt-3 text-3xl font-black">
                        ${total.toFixed(2)}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 md:items-end">
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
                        {order.status || "completed"}
                      </span>

                      {hasDelivery ? (
                        <button
                          onClick={() => downloadTxt(order)}
                          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-violet-500"
                        >
                          Download TXT
                        </button>
                      ) : (
                        <span className="text-sm text-zinc-500">
                          Delivery pending
                        </span>
                      )}
                    </div>
                  </div>

                  {hasDelivery && (
                    <details className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
                      <summary className="cursor-pointer text-sm text-violet-300">
                        Preview delivery
                      </summary>

                      <pre className="mt-4 max-h-60 overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-4 text-sm text-zinc-300">
                        {order.delivered_content}
                      </pre>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
