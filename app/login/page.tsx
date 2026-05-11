"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/dashboard",
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Revisa tu correo para verificar tu cuenta.");
  }

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

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-4">
          Acceso privado
        </h1>

        <input
          className="w-full border rounded-lg p-3 mb-3"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3 mb-4"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full rounded-lg bg-black text-white p-3 mb-3"
        >
          Entrar
        </button>

        <button
          onClick={register}
          className="w-full rounded-lg border p-3"
        >
          Crear cuenta
        </button>
      </div>
    </main>
  );
}
