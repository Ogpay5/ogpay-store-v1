"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type UserProfile = {
  id: string;
  email: string;
  approved: boolean;
  role: string | null;
  balance: number;
  created_at: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }

  async function loadUsers() {
    const token = await getToken();

    const response = await fetch("/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to load users.");
      return;
    }

    setUsers(data.users || []);
    setLoading(false);
  }

  async function adminAction(
    userId: string,
    action: string
  ) {
    const token = await getToken();

    let amount = 0;

    if (
      action === "add_balance" ||
      action === "remove_balance"
    ) {
      const input = prompt("Enter amount");

      if (!input) return;

      amount = Number(input);

      if (!amount || amount <= 0) {
        alert("Invalid amount.");
        return;
      }
    }

    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        action,
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Action failed.");
      return;
    }

    loadUsers();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0">
        <div className="absolute left-[-8rem] top-[-5rem] h-64 w-[32rem] rotate-[-28deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-700/30 to-black shadow-2xl shadow-black" />
        <div className="absolute right-[-9rem] top-[-6rem] h-72 w-[34rem] rotate-[20deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800/40 to-black shadow-2xl shadow-black" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-5xl font-black tracking-[0.14em]">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
              OG
            </span>
            <span className="text-zinc-100">
              ADMIN
            </span>
          </h1>

          <a
            href="/dashboard"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:bg-white/5"
          >
            Dashboard
          </a>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              Users
            </h2>

            <p className="text-zinc-500">
              {users.length} users
            </p>
          </div>

          <div className="space-y-5">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-xl font-semibold">
                      {user.email}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] ${
                        user.approved
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-red-500/10 text-red-300"
                      }`}>
                        {user.approved ? "Approved" : "Blocked"}
                      </span>

                      <span className="rounded-full bg-violet-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-violet-300">
                        {user.role || "client"}
                      </span>

                      <span className="rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300">
                        Balance ${Number(user.balance || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        adminAction(user.id, "approve")
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white hover:bg-emerald-500"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        adminAction(user.id, "block")
                      }
                      className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white hover:bg-red-500"
                    >
                      Block
                    </button>

                    <button
                      onClick={() =>
                        adminAction(user.id, "add_balance")
                      }
                      className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white hover:bg-violet-500"
                    >
                      Add Balance
                    </button>

                    <button
                      onClick={() =>
                        adminAction(user.id, "remove_balance")
                      }
                      className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-300 hover:bg-white/5"
                    >
                      Remove Balance
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
