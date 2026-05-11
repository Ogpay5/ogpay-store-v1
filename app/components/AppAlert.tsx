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
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 px-6 pt-16 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-violet-500/30 bg-[#0a0a0a] p-8 text-white shadow-[0_0_70px_rgba(124,58,237,0.35)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-600 text-lg font-bold">
            !
          </div>

          <h2 className="text-xl font-bold tracking-wide">
            OGPAYTRUE Notice
          </h2>
        </div>

        <p className="leading-7 text-zinc-300">
          {message}
        </p>

        <button
          onClick={() => setMessage("")}
          className="mt-8 w-full rounded-xl bg-violet-600 px-6 py-4 font-semibold uppercase tracking-[0.2em] text-white hover:bg-violet-500"
        >
          OK
        </button>
      </div>
    </div>
  );
}
