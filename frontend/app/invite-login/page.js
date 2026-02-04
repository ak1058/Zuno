"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function InviteLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    
    const [formData, setFormData] = useState({
        email: email,
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        // Restore email from localStorage if available
        const savedEmail = localStorage.getItem("invite_email");
        if (savedEmail && !email) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
        }
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            // Login successful, check if we have an invite token
            const inviteToken = localStorage.getItem("invite_token");
            if (inviteToken) {
                // Automatically accept the invitation
                const acceptResponse = await fetch("/api/invites/accept", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token: inviteToken }),
                });

                const acceptData = await acceptResponse.json();

                if (!acceptResponse.ok) {
                    throw new Error(acceptData.error || "Failed to accept invitation");
                }

                // Clear invite data from localStorage
                localStorage.removeItem("invite_token");
                localStorage.removeItem("invite_email");
                localStorage.removeItem("invite_full_name");

                // Redirect to dashboard
                router.push("/dashboard");
            } else {
                // No invite, just go to dashboard
                router.push("/dashboard");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = () => {
        router.push("/invite-register");
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-900/30 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-900/30 blur-[120px]" />
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block">
                            <h1 className="text-3xl font-bold mb-2">Zuno</h1>
                        </Link>
                        <p className="text-zinc-400">Sign in to accept your invitation</p>
                    </div>

                    {/* Login Card */}
                    <div className="border border-white/10 bg-black/50 rounded-2xl p-8 backdrop-blur-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2">Welcome back</h2>
                            <p className="text-zinc-400">
                                Sign in with your email to accept the workspace invitation
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                    placeholder="you@example.com"
                                    required
                                    readOnly={!!email}
                                />
                                {email && (
                                    <p className="text-xs text-zinc-500 mt-1">
                                        This is the email address you were invited with
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-zinc-300">
                                        Password
                                    </label>
                                    <Link 
                                        href="/forgot-password" 
                                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember-me"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 bg-white/5 border border-white/10 rounded focus:ring-indigo-500 focus:ring-2"
                                />
                                <label htmlFor="remember-me" className="ml-2 text-sm text-zinc-400">
                                    Remember me
                                </label>
                            </div>

                            {error && (
                                <div className="p-3 border border-red-500/20 bg-red-900/10 rounded-lg">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    "Sign In & Accept Invitation"
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-white/10"></div>
                            <span className="mx-4 text-sm text-zinc-500">Don't have an account?</span>
                            <div className="flex-1 border-t border-white/10"></div>
                        </div>

                        {/* Create Account */}
                        <button
                            onClick={handleCreateAccount}
                            className="w-full px-6 py-3 border border-white/10 hover:bg-white/5 rounded-lg font-medium transition-colors"
                        >
                            Create New Account
                        </button>

                        {/* Back Link */}
                        <div className="mt-6 text-center">
                            <Link 
                                href="/accept-invite"
                                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to invitation
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-zinc-500">
                            By signing in, you agree to our{" "}
                            <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}