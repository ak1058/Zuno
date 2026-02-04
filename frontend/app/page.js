import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-900/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-900/30 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              Zuno
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-sm text-zinc-400 hover:text-white transition-colors">
                About Us
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-white px-6 py-2 text-sm font-medium text-black transition-all hover:bg-zinc-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
              href="/register"
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
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-full px-8 font-medium text-zinc-400 transition-colors hover:text-white"
            >
              View features
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-bold mb-16">
            Everything you need to stay organized
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-white/10 bg-white/5 rounded-2xl p-8 backdrop-blur-xl">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2">Intuitive Interface</h3>
              <p className="text-zinc-400">Clean, distraction-free design that lets you focus on what matters.</p>
            </div>
            <div className="border border-white/10 bg-white/5 rounded-2xl p-8 backdrop-blur-xl">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-zinc-400">Optimized performance for seamless task management.</p>
            </div>
            <div className="border border-white/10 bg-white/5 rounded-2xl p-8 backdrop-blur-xl">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-zinc-400">Your data is encrypted and protected at all times.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-zinc-400 mb-16">Choose the plan that works for you</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="border border-white/10 bg-white/5 rounded-2xl p-8 backdrop-blur-xl">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-zinc-400">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-zinc-300">Up to 50 tasks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-zinc-300">Basic features</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-zinc-300">Mobile app access</span>
                </li>
              </ul>
              <Link href="/register" className="block w-full text-center rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium hover:bg-white/10 transition-colors">
                Get Started
              </Link>
            </div>
            <div className="border border-indigo-500/50 bg-indigo-500/10 rounded-2xl p-8 backdrop-blur-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">$9<span className="text-lg text-zinc-400">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-zinc-300">Unlimited tasks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-zinc-300">Advanced features</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-zinc-300">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-zinc-300">Team collaboration</span>
                </li>
              </ul>
              <Link href="/register" className="block w-full text-center rounded-full bg-indigo-500 px-6 py-3 font-medium hover:bg-indigo-600 transition-colors">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">About Zuno</h2>
          <p className="text-lg text-zinc-400 mb-8">
            We believe that productivity tools should be simple, beautiful, and accessible to everyone. 
            Zuno was created to help individuals and teams manage their tasks without the overwhelming 
            complexity of traditional project management software.
          </p>
          <p className="text-lg text-zinc-400">
            Our mission is to help you focus on what truly matters by providing a seamless, 
            distraction-free experience that adapts to your workflow.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-6 mt-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold">Zuno</div>
            <div className="flex gap-8">
              <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-zinc-500">
            © 2026 Zuno. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}