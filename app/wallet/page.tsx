"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type WalletTransaction = {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  created_at: string;
};

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    setBalance(profile?.balance || 0);

    const { data } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setTransactions(data || []);
  }

  async function createTopup() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    if (!amount || Number(amount) <= 0) {
      alert("Invalid amount.");
      return;
    }

    const { error } = await supabase
      .from("topups")
      .insert({
        user_id: user.id,
        amount: Number(amount),
        currency: "USD",
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Topup request created. Crypto integration coming next.");
    setAmount("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0">
        <div className="absolute left-[-8rem] top-[-5rem] h-64 w-[32rem] rotate-[-28deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-700/30 to-black shadow-2xl shadow-black" />
        <div className="absolute right-[-9rem] top-[-6rem] h-72 w-[34rem] rotate-[20deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800/40 to-black shadow-2xl shadow-black" />
      </div>

      <section className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <div className="mb-10 flex items-center justify-between">
          <a href="/dashboard" className="text-2xl font-black tracking-[0.14em]">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
              OG
            </span>
            <span className="text-zinc-100">
              PAYTRUE
            </span>
          </a>

          <a
            href="/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
          >
            Dashboard
          </a>
        </div>

        <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-8 shadow-[0_0_60px_rgba(16,185,129,0.08)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">
            Wallet Balance
          </p>

          <h1 className="mt-4 text-6xl font-black text-emerald-300">
            ${balance.toFixed(2)}
          </h1>
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold">
            Add Funds
          </h2>

          <div className="mt-6 flex flex-col gap-4 md:flex-row">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none focus:border-violet-500"
            />

            <button
              onClick={createTopup}
              className="rounded-xl bg-violet-600 px-8 py-4 font-semibold uppercase tracking-[0.2em] text-white hover:bg-violet-500"
            >
              Create Topup
            </button>
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold">
            Wallet History
          </h2>

          <div className="mt-8 space-y-4">
            {transactions.length === 0 && (
              <p className="text-zinc-500">
                No wallet activity yet.
              </p>
            )}

            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div>
                  <p className="font-semibold uppercase tracking-[0.15em]">
                    {tx.type}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    {tx.note || "Wallet transaction"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-300">
                    ${Number(tx.amount).toFixed(2)}
                  </p>

                  <p className="mt-2 text-xs text-zinc-500">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
