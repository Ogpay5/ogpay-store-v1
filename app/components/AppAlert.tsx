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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-violet-500/30 bg-[#090909] p-5 text-white shadow-[0_0_80px_rgba(124,58,237,0.35)] sm:p-8">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-600 text-xl font-black sm:h-14 sm:w-14 sm:text-2xl">
            !
          </div>

          <div>
            <h2 className="text-xl font-black sm:text-2xl">
              OGPAYTRUE
            </h2>

            <p className="text-xs uppercase tracking-[0.22em] text-violet-300 sm:text-sm sm:tracking-[0.3em]">
              Secure Notice
            </p>
          </div>
        </div>

        <div className="mt-6 max-h-[50vh] overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-4 sm:mt-8 sm:p-6">
          <p className="whitespace-pre-wrap break-words text-base leading-7 text-zinc-200 sm:text-lg sm:leading-8">
            {message}
          </p>
        </div>

        <button
          onClick={() => setMessage("")}
          className="mt-6 w-full rounded-2xl bg-violet-600 px-6 py-4 text-base font-bold uppercase tracking-[0.18em] hover:bg-violet-500 sm:mt-8 sm:py-5 sm:text-lg"
        >
          OK
        </button>
      </div>
    </div>
  );
}
