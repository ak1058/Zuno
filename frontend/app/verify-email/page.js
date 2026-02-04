"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmail() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link. Please check your email and try again.");
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch("/api/auth/verify-email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setStatus("error");
                    setMessage(data.error || "Verification failed. Please try again or contact support.");
                    return;
                }

                setStatus("success");
                setMessage("Your email has been verified successfully!");
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/login?verified=true");
                }, 3000);
            } catch (err) {
                setStatus("error");
                setMessage("Something went wrong. Please try again later.");
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-900/30 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-900/30 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                    {status === "verifying" && (
                        <>
                            <div className="mx-auto w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Verifying Email</h2>
                            <p className="mt-2 text-zinc-400">{message}</p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Email Verified!</h2>
                            <p className="mt-2 text-zinc-400">{message}</p>
                            <p className="mt-4 text-sm text-zinc-500">Redirecting to login...</p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Verification Failed</h2>
                            <p className="mt-2 text-zinc-400">{message}</p>
                            
                            <div className="mt-8 space-y-4">
                                <Link
                                    href="/register"
                                    className="block w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                                >
                                    Register Again
                                </Link>
                                <Link
                                    href="/"
                                    className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                                >
                                    Back to Home
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}