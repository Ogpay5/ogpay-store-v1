"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Product = {
  id: string;
  title: string;
  description: string | null;
  price_per_pack: number;
  lines_per_pack: number;
  stock_count: number;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, approved, balance")
      .eq("id", user.id)
      .single();

    if (!profile?.approved) {
      alert("Your account is waiting for admin approval.");
      await supabase.auth.signOut();
      window.location.href = "/login";
      return;
    }

    setEmail(profile.email);
    setBalance(profile.balance || 0);

    const { data } = await supabase
      .from("products")
      .select("id,title,description,price_per_pack,lines_per_pack,stock_count")
      .eq("active", true)
      .order("title", { ascending: true });

    setProducts(data || []);
    setLoading(false);
  }

  async function addToCart(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity_packs")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity_packs: existing.quantity_packs + 1 })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity_packs: 1,
        });
    }

    alert("Product added to cart.");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p className="text-zinc-400 tracking-[0.3em] uppercase">Loading...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-5rem] h-64 w-[32rem] rotate-[-28deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-700/30 to-black shadow-2xl shadow-black" />
        <div className="absolute right-[-9rem] top-[-6rem] h-72 w-[34rem] rotate-[20deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800/40 to-black shadow-2xl shadow-black" />
        <div className="absolute bottom-[-8rem] left-[-10rem] h-72 w-[34rem] rotate-[32deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800/35 to-black shadow-2xl shadow-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.10),transparent_30%,transparent_100%)]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <a href="/" className="text-2xl font-black tracking-[0.14em]">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">OG</span>
            <span className="text-zinc-100">PAYTRUE</span>
          </a>

          <nav className="flex items-center gap-3">
            <a href="/orders" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
              Orders
            </a>
            <a href="/cart" className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500">
              Cart
            </a>
            <button onClick={logout} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-black/35 p-8 shadow-[0_0_60px_rgba(124,58,237,0.10)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">
                24/7 ACTIVE
              </p>

              <h1 className="mt-4 text-3xl font-bold md:text-4xl">
                Client Dashboard
              </h1>

              <p className="mt-4 text-zinc-400">
                Logged in as {email}
              </p>

              <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                    Wallet Balance
                  </p>

                  <p className="mt-1 text-3xl font-bold text-emerald-300">
                    ${balance.toFixed(2)}
                  </p>

                  <a
                    href="/wallet"
                    className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-emerald-500"
                  >
                    Add Funds
                  </a>

                  
                </div>
              </div>
            </div>

            
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available Products</h2>
          <p className="text-sm text-zinc-500">{products.length} products</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const availablePacks = Math.floor(product.stock_count / product.lines_per_pack);

            return (
              <div key={product.id} className="rounded-[1.5rem] border border-white/10 bg-black/35 p-6 shadow-2xl backdrop-blur-xl transition hover:border-violet-500/40">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-bold">{product.title}</h3>

                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    {availablePacks > 0 ? "In Stock" : "Out"}
                  </span>
                </div>

                <p className="min-h-16 text-zinc-400">
                  {product.description || "Digital product available for verified clients."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Price</p>
                    <p className="mt-2 text-2xl font-bold">${product.price_per_pack}</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Pack</p>
                    <p className="mt-2 text-2xl font-bold">{product.lines_per_pack}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-zinc-400">
                    Stock: {product.stock_count} lines · {availablePacks} packs available
                  </p>
                </div>

                <button
                  onClick={() => addToCart(product.id)}
                  disabled={availablePacks <= 0}
                  className="mt-6 w-full rounded-xl bg-violet-600 px-6 py-4 font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0_28px_rgba(124,58,237,0.28)] transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  {availablePacks > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
