import Link from "next/link";

export default function GetStarted() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                <div className="text-center">
                    <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8 inline-block">
                        ← Back to Home
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Create your Zuno account</h2>
                    <p className="mt-2 text-zinc-400">Start organizing your life today.</p>
                </div>

                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                                Email address
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="mt-2 block w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="you@example.com"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                        >
                            Continue with Email
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-black px-2 text-zinc-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                                <span>Google</span>
                            </button>
                            <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                                <span>GitHub</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
