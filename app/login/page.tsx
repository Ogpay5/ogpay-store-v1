export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-5rem] h-64 w-[32rem] rotate-[-28deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-700/30 to-black shadow-2xl shadow-black" />
        <div className="absolute right-[-9rem] top-[-6rem] h-72 w-[34rem] rotate-[20deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800/40 to-black shadow-2xl shadow-black" />
        <div className="absolute bottom-[-8rem] left-[-10rem] h-72 w-[34rem] rotate-[32deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800/35 to-black shadow-2xl shadow-black" />
        <div className="absolute bottom-[-9rem] right-[-10rem] h-72 w-[34rem] rotate-[-28deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800/35 to-black shadow-2xl shadow-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_28%,transparent_100%)]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <div className="mb-10 flex justify-between items-center">
            <h1 className="text-3xl font-black tracking-[0.14em]">
              <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
                OG
              </span>
              <span className="text-zinc-100">
                PAYTRUE
              </span>
            </h1>

            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/35 px-5 py-3 text-sm font-medium tracking-widest text-emerald-300 shadow-2xl backdrop-blur-md">
              <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
              24/7 ACTIVE
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-500/20 bg-black/40 p-10 shadow-[0_0_60px_rgba(124,58,237,0.18)] backdrop-blur-xl">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-wide">
                <span className="text-violet-400">
                  LOGIN
                </span>{" "}
                YOUR ACCOUNT
              </h2>

              <p className="mt-4 text-zinc-400">
                Welcome back. Enter your credentials.
              </p>
            </div>

            <div className="mt-10 space-y-6">
              <div>
                <label className="mb-3 block text-sm uppercase tracking-[0.3em] text-zinc-500">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm uppercase tracking-[0.3em] text-zinc-500">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition focus:border-violet-500"
                />

                <div className="mt-3 text-right">
                  <a
                    href="#"
                    className="text-sm text-violet-400 hover:text-violet-300"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <button className="w-full rounded-xl bg-violet-600 px-10 py-5 text-lg font-semibold uppercase tracking-[0.25em] text-white shadow-[0_0_32px_rgba(124,58,237,0.35)] transition hover:bg-violet-500">
                Login
              </button>

              <div className="pt-4 text-center">
                <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                  Don’t have an account?
                </p>

                <a
                  href="/register"
                  className="mt-5 inline-block w-full rounded-xl border border-violet-500/50 px-10 py-5 text-lg font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-violet-500/10"
                >
                  Register
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
