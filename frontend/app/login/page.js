"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "../components/theme-toggle";

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showRegisteredMessage, setShowRegisteredMessage] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (searchParams.get("registered") === "true") {
            setShowRegisteredMessage(true);
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

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
                if (response.status === 403) {
                    setError("Please verify your email before logging in.");
                } else {
                    setError(data.error || "Invalid email or password.");
                }
                setLoading(false);
                return;
            }

            // Redirect to dashboard or the page user was trying to access
            const redirect = searchParams.get("redirect") || "/dashboard";
            router.push(redirect);
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block">
                            ← Back to Home
                        </Link>
                        <ThemeToggle />
                    </div>

                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                        <p className="mt-2 text-muted-foreground">Sign in to your Zuno account</p>
                    </div>

                    <div className="border border-border bg-card rounded-2xl p-8 backdrop-blur-xl">
                        {showRegisteredMessage && (
                            <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-sm text-green-500">
                                Registration successful! Please check your email to verify your account before logging in.
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-500">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="mt-2 block w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                        Password
                                    </label>
                                    <Link href="#" className="text-sm text-primary hover:text-primary/80">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative mt-2">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="block w-full rounded-lg border border-input bg-background px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[44px]"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="flex items-center space-x-1">
                                            <div className="h-2 w-2 animate-bounce rounded-full bg-primary-foreground [animation-delay:-0.3s]"></div>
                                            <div className="h-2 w-2 animate-bounce rounded-full bg-primary-foreground [animation-delay:-0.15s]"></div>
                                            <div className="h-2 w-2 animate-bounce rounded-full bg-primary-foreground"></div>
                                        </div>
                                        <span className="ml-3">Signing in...</span>
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}