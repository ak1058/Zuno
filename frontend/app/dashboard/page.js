"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
            router.push("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-900/30 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-900/30 blur-[120px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-20 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">Zuno</div>
                        
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-6">
                <div className="w-full max-w-4xl space-y-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-indigo-300 backdrop-blur-xl">
                        <span>🎉 Welcome to Zuno Dashboard</span>
                    </div>

                    <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Coming Soon
                    </h1>

                    <p className="mx-auto max-w-2xl text-lg text-zinc-400">
                        We're building something amazing for you. Stay tuned for exciting features that will transform the way you manage your tasks.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mt-16">
                        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="text-lg font-semibold mb-2">Task Management</h3>
                            <p className="text-sm text-zinc-400">Create, organize, and track your tasks with ease.</p>
                        </div>

                        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="text-4xl mb-4">👥</div>
                            <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
                            <p className="text-sm text-zinc-400">Work together seamlessly with your team members.</p>
                        </div>

                        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                            <p className="text-sm text-zinc-400">Gain insights into your productivity patterns.</p>
                        </div>
                    </div>

                    <div className="mt-12 p-6 border border-white/10 bg-white/5 rounded-2xl backdrop-blur-xl">
                        <h3 className="text-xl font-semibold mb-3">What's Next?</h3>
                        <p className="text-zinc-400 mb-4">
                            We're working hard to bring you the best task management experience. Here's what you can expect:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 text-left">
                            <div className="flex items-start gap-3">
                                <span className="text-indigo-500 mt-1">✓</span>
                                <span className="text-sm text-zinc-300">Intuitive task creation and organization</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-indigo-500 mt-1">✓</span>
                                <span className="text-sm text-zinc-300">Real-time collaboration features</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-indigo-500 mt-1">✓</span>
                                <span className="text-sm text-zinc-300">Smart notifications and reminders</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-indigo-500 mt-1">✓</span>
                                <span className="text-sm text-zinc-300">Cross-platform synchronization</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-zinc-500 mt-8">
                        Have feedback or suggestions? We'd love to hear from you!
                    </p>
                </div>
            </main>
        </div>
    );
}