export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-7rem] h-64 w-[32rem] rotate-[-28deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-700/25 to-black shadow-2xl shadow-black" />
        <div className="absolute right-[-12rem] top-[-7rem] h-72 w-[34rem] rotate-[20deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800/35 to-black shadow-2xl shadow-black" />
        <div className="absolute bottom-[-10rem] left-[-12rem] h-72 w-[34rem] rotate-[32deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800/30 to-black shadow-2xl shadow-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_30%,transparent_100%)]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-3xl text-center">
          <div className="mb-12 flex justify-center md:justify-end">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/35 px-5 py-3 text-xs font-medium tracking-[0.25em] text-emerald-300 shadow-2xl backdrop-blur-md md:text-sm">
              <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
              24/7 ACTIVE
            </div>
          </div>

          <h1 className="mx-auto max-w-[92%] text-center text-[clamp(2.7rem,12vw,6rem)] font-black leading-none tracking-[0.05em] sm:max-w-full">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
              OG
            </span>
            <span className="text-zinc-100 drop-shadow-[0_0_24px_rgba(255,255,255,0.22)]">
              PAYTRUE
            </span>
          </h1>

          <div className="mx-auto mt-9 h-1 w-16 rounded-full bg-violet-500 shadow-[0_0_24px_rgba(139,92,246,0.95)]" />

          <p className="mt-9 text-center text-xs font-medium uppercase tracking-[0.35em] text-zinc-400 md:text-sm md:tracking-[0.5em]">
            We accept crypto
          </p>

          <div className="mt-10 flex items-center justify-center gap-5">
            <div className="flex flex-col items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-full border border-orange-400/30 bg-orange-500 text-3xl font-black text-white shadow-[0_0_35px_rgba(249,115,22,0.35)]">
                ₿
              </div>

              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                  Bitcoin
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">
                  BTC
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-full border border-zinc-500/30 bg-zinc-700 text-3xl font-black text-white shadow-[0_0_35px_rgba(113,113,122,0.25)]">
                Ξ
              </div>

              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                  Ethereum
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  ETH
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-full border border-emerald-400/30 bg-emerald-500 text-3xl font-black text-white shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                ₮
              </div>

              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                  USDT
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
                  USDT
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-full border border-blue-400/30 bg-blue-500 text-3xl font-black text-white shadow-[0_0_35px_rgba(59,130,246,0.3)]">
                Ł
              </div>

              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                  Litecoin
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400">
                  LTC
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-violet-500/20 bg-black/30 p-6 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-300">
              And many more...
            </p>

            <p className="mt-4 text-sm leading-7 text-zinc-500">
              We support multiple cryptocurrencies across secure private infrastructure.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-2xl gap-5">
            <a href="/register" className="rounded-2xl bg-violet-600 px-8 py-5 text-center text-base font-bold uppercase tracking-[0.3em] text-white shadow-[0_0_32px_rgba(124,58,237,0.35)] transition hover:bg-violet-500 md:text-lg">
              Register
            </a>

            <a href="/login" className="rounded-2xl border border-violet-500/70 bg-black/20 px-8 py-5 text-center text-base font-bold uppercase tracking-[0.3em] text-white backdrop-blur-md transition hover:bg-violet-500/10 md:text-lg">
              Login
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
