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
    }

    alert(
      "Account created.\n\nPlease check your email to verify your account.\n\nAfter verification, your access must be approved by admin for privacy and security."
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-8 text-white">
      <section className="mx-auto flex min-h-screen max-w-xl flex-col justify-center">
        <div className="rounded-[2rem] border border-violet-500/20 bg-black/50 p-7 shadow-[0_0_60px_rgba(124,58,237,0.18)] backdrop-blur-xl sm:p-10">
          <h1 className="text-center text-4xl font-black tracking-[0.14em] sm:text-5xl">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
              OG
            </span>
            <span className="text-zinc-100">
              PAYTRUE
            </span>
          </h1>

          <h2 className="mt-14 text-center text-4xl font-black leading-tight sm:text-5xl">
            CREATE YOUR ACCOUNT
          </h2>

          <p className="mt-5 text-center text-lg text-zinc-400">
            Join our private platform
          </p>

          <div className="mt-10 space-y-5">
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={register}
              className="w-full rounded-2xl bg-violet-600 px-8 py-5 text-lg font-bold uppercase tracking-[0.2em] text-white hover:bg-violet-500"
            >
              Create Account
            </button>

            <a
              href="/login"
              className="block text-center text-sm text-zinc-400"
            >
              Already have an account?{" "}
              <span className="text-violet-400 hover:text-violet-300">
                Login
              </span>
            </a>
          </div>

          <div className="mt-10 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 shadow-[0_0_40px_rgba(251,191,36,0.10)]">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
              Privacy Notice • Aviso
            </p>

            <p className="mt-4 text-sm leading-6 text-zinc-200">
              New client registrations require manual admin approval before access is granted.
            </p>

            <div className="my-4 h-px bg-white/10" />

            <p className="text-sm leading-6 text-zinc-400">
              Los nuevos registros requieren aprobación manual del administrador antes de otorgar acceso.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
