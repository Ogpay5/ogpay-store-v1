"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
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
      return;
    }

    setAnalytics(json.analytics);
    setLoading(false);
  }

  if (loading) {
    return <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading...</main>;
  }

  const cards = [
    ["Revenue", `$${Number(analytics.totalRevenue || 0).toFixed(2)}`],
    ["Topups", `$${Number(analytics.totalTopups || 0).toFixed(2)}`],
    ["User Balances", `$${Number(analytics.totalBalance || 0).toFixed(2)}`],
    ["Orders", analytics.totalOrders],
    ["Users", analytics.totalUsers],
    ["Approved Users", analytics.approvedUsers],
    ["Products", analytics.totalProducts],
    ["Active Products", analytics.activeProducts],
    ["Stock Lines", analytics.totalStock],
  ];

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-5xl font-black tracking-[0.14em]">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">OG</span>
            <span> ANALYTICS</span>
          </h1>

          <a href="/admin" className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:bg-white/5">
            Admin
          </a>
        </div>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-[2rem] border border-white/10 bg-black/35 p-8">
              <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">{label}</p>
              <h2 className="mt-4 text-4xl font-black text-violet-300">{value}</h2>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
