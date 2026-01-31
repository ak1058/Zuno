import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-900/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-900/30 blur-[120px]" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Hero Section */}
        <div className="space-y-8 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-indigo-300 backdrop-blur-xl">
            <span>🚀 The Future of Productivity</span>
          </div>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Manage tasks without <br /> the chaos.
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-zinc-400 sm:text-xl">
            Zuno streamlines your workflow with an intuitive, distraction-free interface.
            Focus on what matters most—getting things done.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/get-started"
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-white px-8 font-medium text-black transition-all hover:bg-zinc-200"
            >
              <span className="mr-2">Get Started Free</span>
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <Link
              href="#"
              className="inline-flex h-12 items-center justify-center rounded-full px-8 font-medium text-zinc-400 transition-colors hover:text-white"
            >
              View features
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
