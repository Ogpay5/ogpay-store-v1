"use client";

import { useEffect, useState } from "react";

export default function AppAlert() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.alert = (msg?: any) => {
      setMessage(String(msg || ""));
    };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 px-6 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-[2rem] border border-violet-500/30 bg-[#090909] p-8 text-white shadow-[0_0_80px_rgba(124,58,237,0.35)]">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-600 text-2xl font-black">
            !
          </div>

          <div>
            <h2 className="text-2xl font-black">
              OGPAYTRUE
            </h2>

            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
              Secure Notice
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-6">
          <p className="whitespace-pre-wrap text-lg leading-8 text-zinc-200">
            {message}
          </p>
        </div>

        <button
          onClick={() => setMessage("")}
          className="mt-8 w-full rounded-2xl bg-violet-600 px-6 py-5 text-lg font-bold uppercase tracking-[0.2em] hover:bg-violet-500"
        >
          OK
        </button>
      </div>
    </div>
  );
}
