"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function InviteRegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    
    const [formData, setFormData] = useState({
        email: email,
        full_name: "",
        password: "",
        confirm_password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        // Restore data from localStorage if available
        const savedEmail = localStorage.getItem("invite_email");
        const savedFullName = localStorage.getItem("invite_full_name");
        
        if (savedEmail && !email) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
        }
        if (savedFullName) {
            setFormData(prev => ({ ...prev, full_name: savedFullName }));
        }
    }, [email]);

    useEffect(() => {
        // Calculate password strength
        const calculateStrength = (password) => {
            let strength = 0;
            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            return strength;
        };

        setPasswordStrength(calculateStrength(formData.password));
    }, [formData.password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.full_name.trim()) {
            setError("Full name is required");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            // Get invite token from localStorage
            const inviteToken = localStorage.getItem("invite_token");
            
            if (!inviteToken) {
                throw new Error("Invitation token not found. Please use the original invitation link.");
            }

            // Accept invitation with registration
            const response = await fetch("/api/invites/accept", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: inviteToken,
                    full_name: formData.full_name,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.detail || "Failed to create account and accept invitation");
            }

            // Clear invite data from localStorage
            localStorage.removeItem("invite_token");
            localStorage.removeItem("invite_email");
            localStorage.removeItem("invite_full_name");

            // Show success message and redirect
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
            
            // You could show a success message here
            setError(null);
            alert("Account created successfully! You're being redirected to your dashboard.");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        router.push("/invite-login");
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
                        <p className="text-zinc-400">Create account to accept your invitation</p>
                    </div>

                    {/* Register Card */}
                    <div className="border border-white/10 bg-black/50 rounded-2xl p-8 backdrop-blur-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2">Create Your Account</h2>
                            <p className="text-zinc-400">
                                You're joining a workspace. Let's create your account.
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
                                <p className="text-xs text-zinc-500 mt-1">
                                    This is the email address you were invited with
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                    placeholder="Create a password"
                                    required
                                />
                                
                                {/* Password Strength Indicator */}
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`flex-1 h-1 rounded-full ${
                                                    passwordStrength >= level
                                                        ? level === 1 ? "bg-red-500" :
                                                          level === 2 ? "bg-yellow-500" :
                                                          level === 3 ? "bg-blue-500" :
                                                          "bg-green-500"
                                                        : "bg-white/10"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-zinc-400">
                                        {formData.password.length === 0 ? "Enter a password" :
                                         formData.password.length < 8 ? "Too short" :
                                         passwordStrength === 1 ? "Weak" :
                                         passwordStrength === 2 ? "Fair" :
                                         passwordStrength === 3 ? "Good" :
                                         "Strong"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirm_password}
                                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                    placeholder="Confirm your password"
                                    required
                                />
                                {formData.confirm_password && formData.password !== formData.confirm_password && (
                                    <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                                )}
                            </div>

                            <div className="text-sm text-zinc-400">
                                <p className="mb-2">Password must contain:</p>
                                <ul className="space-y-1">
                                    <li className={`flex items-center gap-2 ${formData.password.length >= 8 ? "text-green-400" : ""}`}>
                                        <span>{formData.password.length >= 8 ? "✓" : "○"}</span>
                                        <span>At least 8 characters</span>
                                    </li>
                                </ul>
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
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    "Create Account & Accept Invitation"
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-white/10"></div>
                            <span className="mx-4 text-sm text-zinc-500">Already have an account?</span>
                            <div className="flex-1 border-t border-white/10"></div>
                        </div>

                        {/* Login Link */}
                        <button
                            onClick={handleLoginRedirect}
                            className="w-full px-6 py-3 border border-white/10 hover:bg-white/5 rounded-lg font-medium transition-colors"
                        >
                            Sign In Instead
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
                            By creating an account, you agree to our{" "}
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