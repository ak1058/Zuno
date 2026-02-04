"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AcceptInvitePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    
    const [inviteDetails, setInviteDetails] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [step, setStep] = useState("loading"); // loading, invite_details, login, register, success
    const [isAccepting, setIsAccepting] = useState(false);
    const [acceptError, setAcceptError] = useState(null);

    useEffect(() => {
        if (!token) {
            setError("Invalid invite link. No token provided.");
            setLoading(false);
            return;
        }
        fetchInviteDetails();
        checkCurrentUser();
    }, [token]);

    const fetchInviteDetails = async () => {
        try {
            const response = await fetch(`/api/invites/details?token=${token}`);
            if (!response.ok) {
                throw new Error("Failed to fetch invite details");
            }
            const data = await response.json();
            setInviteDetails(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkCurrentUser = async () => {
        try {
            // Try to get current user info from token
            const response = await fetch("/api/auth/me");
            if (response.ok) {
                const userData = await response.json();
                setCurrentUser(userData);
            }
        } catch (err) {
            // User not logged in, that's fine
        }
    };

    const handleAcceptInvitation = async (fullName = null, password = null) => {
        try {
            setIsAccepting(true);
            setAcceptError(null);

            const requestBody = { token };
            if (fullName) requestBody.full_name = fullName;
            if (password) requestBody.password = password;

            const response = await fetch("/api/invites/accept", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.detail || "Failed to accept invitation");
            }

            // If new user was created, we get access_token in response
            if (data.is_new_user) {
                // User is now logged in with the new account
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    router.push("/dashboard");
                }, 2000);
                setStep("success");
            } else {
                // Existing user - redirect to dashboard immediately
                router.push("/dashboard");
            }
        } catch (err) {
            setAcceptError(err.message);
        } finally {
            setIsAccepting(false);
        }
    };

    const handleLoginRedirect = () => {
        // Store invite token in localStorage for later use
        if (token && inviteDetails) {
            localStorage.setItem("invite_token", token);
            localStorage.setItem("invite_email", inviteDetails.email);
        }
        router.push(`/invite-login?email=${encodeURIComponent(inviteDetails.email)}`);
    };

    const handleRegisterRedirect = () => {
        // Store invite token in localStorage for later use
        if (token && inviteDetails) {
            localStorage.setItem("invite_token", token);
            localStorage.setItem("invite_email", inviteDetails.email);
            localStorage.setItem("invite_full_name", inviteDetails.invited_by); // Can use as suggested name
        }
        router.push(`/invite-register?email=${encodeURIComponent(inviteDetails.email)}`);
    };

    useEffect(() => {
        if (!loading && inviteDetails) {
            if (currentUser) {
                // User is logged in
                if (currentUser.email === inviteDetails.email) {
                    // Same user - can accept immediately
                    setStep("invite_details");
                } else {
                    // Different user - need to switch accounts
                    setStep("different_user");
                }
            } else {
                // User not logged in
                setStep("invite_details");
            }
        }
    }, [loading, inviteDetails, currentUser]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading invitation details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="border border-red-500/20 bg-red-900/10 rounded-2xl p-8 backdrop-blur-xl text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
                        <p className="text-zinc-400 mb-6">{error}</p>
                        <Link 
                            href="/"
                            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (step === "success") {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="border border-green-500/20 bg-green-900/10 rounded-2xl p-8 backdrop-blur-xl text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h1 className="text-2xl font-bold mb-2">Invitation Accepted!</h1>
                        <p className="text-zinc-400 mb-6">
                            You have successfully joined {inviteDetails.workspace_name}. 
                            You will be redirected to your dashboard shortly.
                        </p>
                        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-900/30 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-900/30 blur-[120px]" />
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="max-w-lg w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block">
                            <h1 className="text-3xl font-bold mb-2">Zuno</h1>
                        </Link>
                        <p className="text-zinc-400">Join your team workspace</p>
                    </div>

                    {/* Main Card */}
                    <div className="border border-white/10 bg-black/50 rounded-2xl p-8 backdrop-blur-xl">
                        {inviteDetails && (
                            <>
                                {/* Workspace Info */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold">
                                                {inviteDetails.workspace_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">{inviteDetails.workspace_name}</h2>
                                                <p className="text-sm text-zinc-400">Workspace Invitation</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs rounded-full capitalize ${
                                            inviteDetails.role === 'admin' 
                                                ? 'bg-purple-900/30 text-purple-400 border border-purple-800/50'
                                                : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50'
                                        }`}>
                                            {inviteDetails.role}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm text-zinc-400">Invited by</p>
                                                <p className="font-medium">{inviteDetails.invited_by}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm text-zinc-400">Invited email</p>
                                                <p className="font-medium">{inviteDetails.email}</p>
                                            </div>
                                        </div>

                                        {inviteDetails.expires_at && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm text-zinc-400">Expires</p>
                                                    <p className="font-medium">
                                                        {new Date(inviteDetails.expires_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Different User Warning */}
                                {step === "different_user" && currentUser && (
                                    <div className="mb-6 p-4 border border-yellow-500/20 bg-yellow-900/10 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <div>
                                                <p className="font-medium text-yellow-400 mb-1">Different Account Detected</p>
                                                <p className="text-sm text-yellow-300/70">
                                                    You're currently logged in as <span className="font-medium">{currentUser.email}</span>, 
                                                    but this invitation is for <span className="font-medium">{inviteDetails.email}</span>.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-4">
                                    {step === "invite_details" && (
                                        <>
                                            <button
                                                onClick={() => handleAcceptInvitation()}
                                                disabled={isAccepting}
                                                className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                                            >
                                                {isAccepting ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Accepting Invitation...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Accept Invitation</span>
                                                    </>
                                                )}
                                            </button>
                                            
                                            <p className="text-center text-sm text-zinc-500">
                                                By accepting, you agree to join {inviteDetails.workspace_name} as a {inviteDetails.role}
                                            </p>
                                        </>
                                    )}

                                    {step === "different_user" && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <button
                                                    onClick={handleLoginRedirect}
                                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
                                                >
                                                    Switch to {inviteDetails.email}
                                                </button>
                                                <button
                                                    onClick={handleRegisterRedirect}
                                                    className="px-6 py-3 border border-white/10 hover:bg-white/5 rounded-lg font-medium transition-colors"
                                                >
                                                    Create New Account
                                                </button>
                                            </div>
                                            
                                            <div className="pt-4 border-t border-white/10">
                                                <p className="text-center text-sm text-zinc-500 mb-3">
                                                    Or continue with current account:
                                                </p>
                                                <button
                                                    onClick={() => router.push("/dashboard")}
                                                    className="w-full px-6 py-3 border border-white/10 hover:bg-white/5 rounded-lg font-medium transition-colors"
                                                >
                                                    Go to Dashboard
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Error Message */}
                                {acceptError && (
                                    <div className="mt-6 p-4 border border-red-500/20 bg-red-900/10 rounded-lg">
                                        <div className="flex items-center gap-2 text-red-400 mb-1">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium">Error</span>
                                        </div>
                                        <p className="text-sm text-red-300">{acceptError}</p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <div className="flex items-center justify-between text-sm text-zinc-500">
                                        <span>Zuno Workspace Invitation</span>
                                        <span>ID: {inviteDetails.id.substring(0, 8)}...</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Back to Home Link */}
                    <div className="text-center mt-6">
                        <Link 
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}