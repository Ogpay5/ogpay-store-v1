"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function register() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Check your email to verify your account.");
  }

  async function forgotPassword() {
    if (!email) {
      alert("Enter your email first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password reset link sent to your email.");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-[2rem] border border-violet-500/20 bg-black/40 p-10 shadow-[0_0_60px_rgba(124,58,237,0.18)] backdrop-blur-xl">
          <h1 className="text-center text-3xl font-black tracking-[0.14em]">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">OG</span>
            <span className="text-zinc-100">PAYTRUE</span>
          </h1>

          <h2 className="mt-10 text-center text-3xl font-bold">
            <span className="text-violet-400">LOGIN</span> YOUR ACCOUNT
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
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none focus:border-violet-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none focus:border-violet-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={forgotPassword}
              className="w-full text-right text-sm text-violet-400 hover:text-violet-300"
            >
              Forgot your password?
            </button>

            <button
              onClick={login}
              className="w-full rounded-xl bg-violet-600 px-10 py-5 font-semibold uppercase tracking-[0.25em] text-white hover:bg-violet-500"
            >
              Login
            </button>

            <button
              onClick={register}
              className="w-full rounded-xl border border-violet-500/50 px-10 py-5 font-semibold uppercase tracking-[0.25em] text-white hover:bg-violet-500/10"
            >
              Register
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
