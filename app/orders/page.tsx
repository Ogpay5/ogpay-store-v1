"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type OrderItem = {
  id: string;
  product_title: string;
  quantity_packs: number;
  lines_per_pack: number;
  total_lines: number;
  delivered_content: string | null;
};

type Order = {
  id: string;
  order_code: string | null;
  total_price: number | null;
  status: string | null;
  created_at: string;
  order_items: OrderItem[];
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
      .select(`
        id,
        order_code,
        total_price,
        status,
        created_at,
        order_items (
          id,
          product_title,
          quantity_packs,
          lines_per_pack,
          total_lines,
          delivered_content
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setOrders((data as any) || []);
    setLoading(false);
  }

  function downloadTxt(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-5xl font-black tracking-[0.14em]">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">OG</span>
            <span> ORDERS</span>
          </h1>

          <a href="/dashboard" className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:bg-white/5">
            Dashboard
          </a>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-black/35 p-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Order History</h2>
            <p className="text-zinc-500">{orders.length} orders</p>
          </div>

          <div className="space-y-6">
            {orders.length === 0 && (
              <p className="text-zinc-500">No orders yet.</p>
            )}

            {orders.map((order) => {
              const code = order.order_code || `OG-${order.id.slice(0, 8).toUpperCase()}`;

              return (
                <div key={order.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
                        {code}
                      </p>
                      <h3 className="mt-2 text-3xl font-black">
                        ${Number(order.total_price || 0).toFixed(2)}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
                      {order.status || "delivered"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {order.order_items?.map((item) => {
                      const hasDelivery = Boolean(item.delivered_content?.trim());

                      return (
                        <div key={item.id} className="rounded-xl border border-white/10 bg-black/30 p-5">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <h4 className="text-xl font-bold">{item.product_title}</h4>
                              <p className="mt-2 text-sm text-zinc-400">
                                Packs: {item.quantity_packs} · Lines: {item.total_lines}
                              </p>
                            </div>

                            {hasDelivery ? (
                              <div className="flex flex-wrap gap-3">
                                <button
                                  onClick={() =>
                                    downloadTxt(
                                      item.delivered_content!,
                                      `${code}-${item.product_title}.txt`
                                    )
                                  }
                                  className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-violet-500"
                                >
                                  Download TXT
                                </button>

                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      item.delivered_content || ""
                                    );
                                    alert("Copied to clipboard.");
                                  }}
                                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300 hover:bg-white/5"
                                >
                                  Copy
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-zinc-500">Pending</span>
                            )}
                          </div>

                          {hasDelivery && (
                            <details className="mt-4">
                              <summary className="cursor-pointer text-sm text-violet-300">
                                Preview delivery
                              </summary>
                              <pre className="mt-4 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl bg-black/50 p-4 text-sm text-zinc-300">
                                {item.delivered_content}
                              </pre>
                            </details>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
