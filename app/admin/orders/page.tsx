"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch("/api/admin/overview", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      alert(json.error || "Unauthorized");
      setLoading(false);
      return;
    }

    setOrders(json.orders || []);
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

  function copyTxt(content: string) {
    navigator.clipboard.writeText(content || "");
    alert("Copied to clipboard.");
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-5xl font-black tracking-[0.14em]">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
              OG
            </span>
            <span> ADMIN ORDERS</span>
          </h1>

          <a
            href="/admin"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:bg-white/5"
          >
            Admin
          </a>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-black/35 p-8">
          <div className="space-y-6">
            {orders.map((order) => {
              const code =
                order.order_code ||
                `OG-${order.id.slice(0, 8).toUpperCase()}`;

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
                        {code}
                      </p>

                      <h3 className="mt-2 text-3xl font-black">
                        ${Number(order.total_price || 0).toFixed(2)}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-500">
                        {order.profiles?.email || order.user_id}
                      </p>
                    </div>

                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
                      {order.status || "delivered"}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {order.order_items?.map((item: any) => {
                      const hasDelivery = Boolean(
                        item.delivered_content &&
                          item.delivered_content.trim().length > 0
                      );

                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-white/10 bg-black/30 p-5"
                        >
                          <h4 className="text-xl font-bold">
                            {item.product_title}
                          </h4>

                          <p className="mt-2 text-sm text-zinc-400">
                            Packs: {item.quantity_packs} · Lines:{" "}
                            {item.total_lines}
                          </p>

                          {hasDelivery ? (
                            <>
                              <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                  onClick={() =>
                                    downloadTxt(
                                      item.delivered_content,
                                      `${code}-${item.product_title}.txt`
                                    )
                                  }
                                  className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-violet-500"
                                >
                                  Download TXT
                                </button>

                                <button
                                  onClick={() =>
                                    copyTxt(item.delivered_content)
                                  }
                                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300 hover:bg-white/5"
                                >
                                  Copy
                                </button>
                              </div>

                              <details className="mt-4">
                                <summary className="cursor-pointer text-sm text-violet-300">
                                  Preview delivery
                                </summary>

                                <pre className="mt-4 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl bg-black/50 p-4 text-sm text-zinc-300">
                                  {item.delivered_content}
                                </pre>
                              </details>
                            </>
                          ) : (
                            <p className="mt-4 text-sm text-zinc-500">
                              Delivery pending
                            </p>
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
