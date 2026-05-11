"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register() {
    if (!email || !password) {
      alert("Enter email and password.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://ogpaytrue.org/login",
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        approved: false,
        role: "client",
        balance: 0,
      });

      const notifyResponse = await fetch("/api/admin-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "New OGPAYTRUE Registration",
          message: `
            <p>A new user registration is waiting for approval.</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Panel:</strong> https://ogpaytrue.org/admin</p>
          `,
        }),
      });

      if (!notifyResponse.ok) {
        const notifyError = await notifyResponse.json();
        console.error("Admin email failed:", notifyError);
      }
    }

    alert("Account created. Check your email to verify your account.");
    window.location.href = "/login";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-[2rem] border border-violet-500/20 bg-black/40 p-10 shadow-[0_0_60px_rgba(124,58,237,0.18)] backdrop-blur-xl">
          <h1 className="text-center text-3xl font-black tracking-[0.14em]">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
              OG
            </span>
            <span className="text-zinc-100">
              PAYTRUE
            </span>
          </h1>

          <h2 className="mt-10 text-center text-3xl font-bold">
            CREATE YOUR ACCOUNT
          </h2>

          
          <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
              Privacy Notice
            </p>

            <p className="mt-3 leading-7 text-zinc-300">
              New client registrations require manual admin approval before access is granted to the private portal infrastructure.
            </p>
          </div>

<div className="mt-10 space-y-6">
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none focus:border-violet-500"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none focus:border-violet-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={register}
              className="w-full rounded-xl bg-violet-600 px-10 py-5 font-semibold uppercase tracking-[0.25em] text-white hover:bg-violet-500"
            >
              Register
            </button>

            <a
              href="/login"
              className="block text-center text-sm text-violet-400 hover:text-violet-300"
            >
              Already have an account? Login
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}