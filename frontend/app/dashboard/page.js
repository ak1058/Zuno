"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const router = useRouter();
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWorkspace();
    }, []);

    const fetchWorkspace = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/workspaces/default");
            
            if (response.status === 401) {
                // Token expired or invalid, redirect to login
                router.push("/login");
                return;
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch workspace: ${response.status}`);
            }
            
            const data = await response.json();
            setWorkspace(data);
        } catch (err) {
            setError(err.message);
            console.error("Workspace fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading your workspace...</p>
                </div>
            </div>
        );
    }

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
                        
                        <div className="flex items-center gap-6">
                            {workspace && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-semibold">
                                        {workspace.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{workspace.name}</p>
                                        <p className="text-xs text-zinc-400 capitalize">
                                            {workspace.subscription.plan} plan
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 px-6 py-12">
                <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Welcome Banner */}
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-8 backdrop-blur-xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-indigo-300 mb-4">
                                    <span>🚀 Welcome back to Zuno</span>
                                </div>
                                
                                <h1 className="text-4xl font-bold tracking-tight mb-4">
                                    {workspace ? `Welcome to ${workspace.name}` : "Welcome to Zuno Dashboard"}
                                </h1>
                                
                                <p className="text-zinc-400 max-w-2xl">
                                    {workspace?.description || "We're building something amazing for you. Stay tuned for exciting features that will transform the way you manage your tasks."}
                                </p>
                            </div>
                            
                            {workspace && (
                                <div className="text-right">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-green-900/30 border border-green-800/50 px-4 py-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span className="text-sm font-medium text-green-400">
                                            {workspace.subscription.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Workspace Info & Stats */}
                    {workspace && (
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🏢</span>
                                    Workspace Details
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-zinc-400">Workspace ID</p>
                                        <p className="text-sm font-mono text-zinc-300 truncate">{workspace.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-400">Slug</p>
                                        <p className="text-sm text-zinc-300">{workspace.slug}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-400">Created</p>
                                        <p className="text-sm text-zinc-300">
                                            {new Date(workspace.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <span className="text-2xl">📋</span>
                                    Subscription
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-zinc-400">Plan</p>
                                        <p className="text-sm font-semibold text-indigo-400 capitalize">
                                            {workspace.subscription.plan}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-400">Seats Available</p>
                                        <p className="text-sm text-zinc-300">
                                            {workspace.subscription.seats} members
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-400">Subscription ID</p>
                                        <p className="text-sm font-mono text-zinc-300 truncate">
                                            {workspace.subscription.id}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <span className="text-2xl">⚡</span>
                                    Quick Actions
                                </h3>
                                <div className="space-y-3">
                                    <button className="w-full text-left p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                                        <p className="font-medium">Create New Task</p>
                                        <p className="text-sm text-zinc-400">Start managing your tasks</p>
                                    </button>
                                    <button className="w-full text-left p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                                        <p className="font-medium">Invite Team Members</p>
                                        <p className="text-sm text-zinc-400">({workspace.subscription.seats - 1} seats available)</p>
                                    </button>
                                    <button className="w-full text-left p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                                        <p className="font-medium">Upgrade Plan</p>
                                        <p className="text-sm text-zinc-400">Get more features</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-indigo-500/50 transition-colors">
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="text-lg font-semibold mb-2">Task Management</h3>
                            <p className="text-sm text-zinc-400">Create, organize, and track your tasks with ease.</p>
                        </div>

                        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-indigo-500/50 transition-colors">
                            <div className="text-4xl mb-4">👥</div>
                            <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
                            <p className="text-sm text-zinc-400">Work together seamlessly with your team members.</p>
                        </div>

                        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-indigo-500/50 transition-colors">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                            <p className="text-sm text-zinc-400">Gain insights into your productivity patterns.</p>
                        </div>
                    </div>

                    {/* Coming Soon Section */}
                    <div className="mt-12 p-8 border border-white/10 bg-white/5 rounded-2xl backdrop-blur-xl">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="text-2xl">🚀</span>
                            What's Next?
                        </h3>
                        <p className="text-zinc-400 mb-6">
                            We're working hard to bring you the best task management experience. Here's what you can expect:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 text-left">
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <span className="text-indigo-500 mt-1 text-xl">✓</span>
                                <div>
                                    <span className="text-sm font-medium text-zinc-300">Intuitive task creation</span>
                                    <p className="text-xs text-zinc-500">Drag, drop, and organize with ease</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <span className="text-indigo-500 mt-1 text-xl">✓</span>
                                <div>
                                    <span className="text-sm font-medium text-zinc-300">Real-time collaboration</span>
                                    <p className="text-xs text-zinc-500">Work together seamlessly</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <span className="text-indigo-500 mt-1 text-xl">✓</span>
                                <div>
                                    <span className="text-sm font-medium text-zinc-300">Smart notifications</span>
                                    <p className="text-xs text-zinc-500">Never miss important updates</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <span className="text-indigo-500 mt-1 text-xl">✓</span>
                                <div>
                                    <span className="text-sm font-medium text-zinc-300">Cross-platform sync</span>
                                    <p className="text-xs text-zinc-500">Access anywhere, anytime</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="border border-red-500/20 bg-red-900/10 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex items-center gap-3 text-red-400 mb-2">
                                <span className="text-xl">⚠️</span>
                                <h3 className="font-semibold">Error Loading Workspace</h3>
                            </div>
                            <p className="text-red-300 text-sm mb-4">{error}</p>
                            <button
                                onClick={fetchWorkspace}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-red-500/30 hover:bg-red-500/10 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    <p className="text-sm text-zinc-500 text-center mt-8">
                        Have feedback or suggestions? We'd love to hear from you!
                    </p>
                </div>
            </main>
        </div>
    );
}