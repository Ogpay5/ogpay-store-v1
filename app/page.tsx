export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-5rem] h-64 w-[32rem] rotate-[-28deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-700/30 to-black shadow-2xl shadow-black" />
        <div className="absolute right-[-9rem] top-[-6rem] h-72 w-[34rem] rotate-[20deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800/40 to-black shadow-2xl shadow-black" />
        <div className="absolute bottom-[-8rem] left-[-10rem] h-72 w-[34rem] rotate-[32deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800/35 to-black shadow-2xl shadow-black" />
        <div className="absolute bottom-[-9rem] right-[-10rem] h-72 w-[34rem] rotate-[-28deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800/35 to-black shadow-2xl shadow-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_28%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.45))]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl text-center">
          <div className="mb-20 flex justify-end">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/35 px-5 py-3 text-sm font-medium tracking-widest text-emerald-300 shadow-2xl backdrop-blur-md">
              <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
              24/7 ACTIVE
            </div>
          </div>

          <h1 className="text-6xl font-black tracking-[0.14em] md:text-8xl">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
              OG
            </span>
            <span className="text-zinc-100 drop-shadow-[0_0_24px_rgba(255,255,255,0.22)]">
              PAYTRUE
            </span>
          </h1>

          <div className="mx-auto mt-10 h-1 w-16 rounded-full bg-violet-500 shadow-[0_0_24px_rgba(139,92,246,0.95)]" />

          <p className="mt-10 text-sm font-medium uppercase tracking-[0.5em] text-zinc-400">
            We accept crypto
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-orange-500 text-lg font-bold shadow-lg shadow-orange-500/20">₿</span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-700 text-lg font-bold shadow-lg shadow-zinc-500/10">Ξ</span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-lg font-bold shadow-lg shadow-emerald-500/20">₮</span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-500 text-lg font-bold shadow-lg shadow-blue-500/20">$</span>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl gap-6 sm:grid-cols-2">
            <a href="/register" className="rounded-xl bg-violet-600 px-10 py-5 text-center text-lg font-semibold uppercase tracking-[0.25em] text-white shadow-[0_0_32px_rgba(124,58,237,0.35)] transition hover:bg-violet-500">
              Register
            </a>

            <a href="/login" className="rounded-xl border border-violet-500/70 bg-black/20 px-10 py-5 text-center text-lg font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-md transition hover:bg-violet-500/10">
              Login
            </a>
          </div>
        
          <a
            href="https://t.me/+93kGa-c_OF85ZTQ5"
            target="_blank"
            className="mt-6 flex items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 px-6 py-5 text-center text-sm font-semibold uppercase tracking-[0.25em] text-sky-300 transition hover:bg-sky-500/20"
          >
            Join Official Telegram
          </a>

        </div>
      </section>
    </main>
  );
}
