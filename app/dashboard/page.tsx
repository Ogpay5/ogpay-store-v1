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
    setBalance(Number(profile.balance || 0));

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
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="uppercase tracking-[0.35em] text-zinc-500">Loading</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <a href="/" className="text-2xl font-black tracking-[0.12em]">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">OG</span>
            <span>PAYTRUE</span>
          </a>

          <nav className="flex items-center gap-3">
            <a href="/cart" className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500">
              🛒
              Cart
            </a>

            <a href="/orders" className="flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-zinc-300 hover:bg-white/5">
              📦
              Orders
            </a>

            <a href="/wallet" className="flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-zinc-300 hover:bg-white/5">
              💼
              Wallet
            </a>

            <button onClick={logout} className="flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-zinc-300 hover:bg-white/5">
              🚪
              Logout
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-bold">Client Dashboard</h1>
            <p className="mt-3 text-zinc-400">Welcome back, {email}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-7 py-5">
            <p className="text-sm uppercase tracking-[0.25em] text-violet-400">Status</p>
            <p className="mt-2 text-2xl font-bold">Verified Client</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.25em] text-violet-400">Wallet Balance</p>
            <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-5xl font-black text-emerald-300">${balance.toFixed(2)}</h2>
                <p className="mt-3 text-zinc-400">Available Balance</p>
              </div>

              <a href="/wallet" className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-7 py-4 font-semibold hover:bg-violet-500">
                +
                Add Funds
              </a>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-violet-600/20 text-violet-300">
                📦
              </div>
              <h3 className="text-4xl font-black">{products.length}</h3>
              <p className="mt-2 text-zinc-400">Products Available</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                ✅
              </div>
              <h3 className="text-4xl font-black">24/7</h3>
              <p className="mt-2 text-zinc-400">Active Platform</p>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <a href="/cart" className="text-violet-400 hover:text-violet-300">View cart →</a>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => {
              const packsAvailable = Math.floor(
                Number(product.stock_count || 0) / Number(product.lines_per_pack || 1)
              );

              return (
                <div key={product.id} className="overflow-hidden rounded-3xl border border-white/10 bg-black/40">
                  <div className="grid h-36 place-items-center bg-gradient-to-br from-violet-950 via-black to-violet-900/40">
                    <span className="text-5xl">📦</span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-bold">{product.title}</h3>
                      <span className="rounded-full border border-violet-500/40 px-3 py-1 text-xs text-violet-300">
                        {product.lines_per_pack} lines
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 min-h-12 text-sm text-zinc-400">
                      {product.description || "Premium digital product."}
                    </p>

                    <p className="mt-5 text-2xl font-black text-emerald-300">
                      ${Number(product.price_per_pack).toFixed(2)}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      {packsAvailable} packs available
                    </p>

                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={packsAvailable <= 0}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-500/50 px-5 py-3 font-semibold text-violet-300 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:text-zinc-600"
                    >
                      🛒
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
