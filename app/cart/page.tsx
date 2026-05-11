"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type CartItem = {
  id: string;
  quantity_packs: number;
  product: {
    id: string;
    title: string;
    price_per_pack: number;
    lines_per_pack: number;
  };
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    setBalance(Number(profile?.balance || 0));

    const { data } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity_packs,
        product:products (
          id,
          title,
          price_per_pack,
          lines_per_pack
        )
      `)
      .eq("user_id", user.id);

    setItems(data || []);
    setLoading(false);
  }

  async function removeItem(id: string) {
    await supabase
      .from("cart_items")
      .delete()
      .eq("id", id);

    loadCart();
  }

  async function walletCheckout() {
    const { data } = await supabase.auth.getSession();

    const token = data.session?.access_token;

    if (!token) {
      alert("Not authenticated.");
      return;
    }

    const response = await fetch("/api/wallet-checkout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Checkout failed.");
      return;
    }

    alert(
      `Purchase completed.\n\nDelivered ${result.delivered} lines.`
    );

    window.location.href = "/orders";
  }

  const total = items.reduce(
    (sum, item) =>
      sum +
      Number(item.product.price_per_pack) *
        Number(item.quantity_packs),
    0
  );

  const enoughBalance = balance >= total;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-5xl font-black tracking-[0.14em]">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
              OG
            </span>
            <span className="text-zinc-100">
              CART
            </span>
          </h1>

          <a
            href="/dashboard"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:bg-white/5"
          >
            Dashboard
          </a>
        </div>

        <div className="mb-8 rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">
            Wallet Balance
          </p>

          <h2 className="mt-4 text-5xl font-black text-emerald-300">
            ${balance.toFixed(2)}
          </h2>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl">
          <h2 className="text-3xl font-bold">
            Cart Items
          </h2>

          <div className="mt-8 space-y-5">
            {items.length === 0 && (
              <p className="text-zinc-500">
                Your cart is empty.
              </p>
            )}

            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {item.product.title}
                    </h3>

                    <div className="mt-3 text-zinc-400">
                      <p>
                        Packs: {item.quantity_packs}
                      </p>

                      <p>
                        Lines per pack: {item.product.lines_per_pack}
                      </p>

                      <p>
                        Price per pack: $
                        {item.product.price_per_pack}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <p className="text-3xl font-bold">
                      $
                      {(
                        Number(item.product.price_per_pack) *
                        Number(item.quantity_packs)
                      ).toFixed(2)}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-300 hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="mt-10 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">
                    Total
                  </p>

                  <h2 className="mt-3 text-5xl font-black">
                    ${total.toFixed(2)}
                  </h2>

                  <p className={`mt-4 text-sm ${
                    enoughBalance
                      ? "text-emerald-300"
                      : "text-red-300"
                  }`}>
                    {enoughBalance
                      ? "Sufficient wallet balance."
                      : "Insufficient wallet balance."}
                  </p>
                </div>

                <button
                  disabled={!enoughBalance}
                  onClick={walletCheckout}
                  className="rounded-xl bg-violet-600 px-8 py-5 text-lg font-semibold uppercase tracking-[0.2em] text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  Pay With Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
