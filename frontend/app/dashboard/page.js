"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const router = useRouter();
    const [workspaces, setWorkspaces] = useState([]);
    const [currentWorkspace, setCurrentWorkspace] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [workspaceMembers, setWorkspaceMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [newWorkspaceData, setNewWorkspaceData] = useState({ name: "", description: "" });
    const [inviteData, setInviteData] = useState({ email: "", role: "member" });
    const [isCreating, setIsCreating] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [pendingInvites, setPendingInvites] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch subscription plan
            const subscriptionRes = await fetch("/api/subscription/current-plan-details");
            if (subscriptionRes.ok) {
                const subscriptionData = await subscriptionRes.json();
                setSubscription(subscriptionData);
            }

            // Fetch workspaces
            const workspacesRes = await fetch("/api/workspaces/my-workspaces");
            if (workspacesRes.status === 401) {
                router.push("/login");
                return;
            }
            
            if (!workspacesRes.ok) {
                throw new Error(`Failed to fetch workspaces: ${workspacesRes.status}`);
            }
            
            const workspacesData = await workspacesRes.json();
            setWorkspaces(workspacesData);
            
            // Set first workspace as current
            if (workspacesData.length > 0) {
                setCurrentWorkspace(workspacesData[0]);
                fetchWorkspaceMembers(workspacesData[0].id);
            }
            fetchPendingInvites();
            
        } catch (err) {
            setError(err.message);
            console.error("Dashboard data fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkspaceMembers = async (workspaceId) => {
        try {
            const response = await fetch(`/api/workspaces/members?workspace_id=${workspaceId}`);
            if (response.ok) {
                const membersData = await response.json();
                setWorkspaceMembers(membersData);
            }
        } catch (err) {
            console.error("Failed to fetch workspace members:", err);
        }
    };

    const handleCreateWorkspace = async () => {
        if (!newWorkspaceData.name.trim()) {
            alert("Workspace name is required");
            return;
        }

        try {
            setIsCreating(true);
            const response = await fetch("/api/workspaces/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newWorkspaceData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.detail || "Failed to create workspace");
            }

            // Refresh workspaces list
            fetchDashboardData();
            setShowNewWorkspaceModal(false);
            setNewWorkspaceData({ name: "", description: "" });
            
            alert("Workspace created successfully!");
        } catch (err) {
            alert(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleInviteMember = async () => {
        if (!inviteData.email.trim() || !currentWorkspace) {
            alert("Email and workspace are required");
            return;
        }

        try {
            setIsInviting(true);
            const response = await fetch("/api/workspaces/invite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    workspace_id: currentWorkspace.id,
                    email: inviteData.email,
                    role: inviteData.role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.detail || "Failed to invite member");
            }

            // Refresh workspace members
            fetchWorkspaceMembers(currentWorkspace.id);
            setShowInviteModal(false);
            setInviteData({ email: "", role: "member" });
            
            alert("Invitation sent successfully!");
        } catch (err) {
            alert(err.message);
        } finally {
            setIsInviting(false);
        }
    };

    const handleWorkspaceChange = (workspace) => {
        setCurrentWorkspace(workspace);
        fetchWorkspaceMembers(workspace.id);
    };

    const fetchPendingInvites = async () => {
        try {
            const response = await fetch("/api/invites/pending");
            if (response.ok) {
                const data = await response.json();
                setPendingInvites(data);
            }
        } catch (err) {
            console.error("Failed to fetch pending invites:", err);
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
                    <p className="text-zinc-400">Loading your dashboard...</p>
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

            {/* Navigation */}
            <nav className="relative z-20 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">Zuno</div>
                        
                        <div className="flex items-center gap-6">
                            {/* Workspace Selector */}
                            {workspaces.length > 0 && (
                                <div className="relative group">
                                    <button className="flex items-center gap-3 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-semibold">
                                            {currentWorkspace?.name.charAt(0) || "W"}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">{currentWorkspace?.name || "Select Workspace"}</p>
                                            <p className="text-xs text-zinc-400">
                                                {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    <div className="absolute right-0 mt-2 w-64 bg-black/90 border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 backdrop-blur-xl z-50">
                                        <div className="py-2">
                                            {workspaces.map((workspace) => (
                                                <button
                                                    key={workspace.id}
                                                    onClick={() => handleWorkspaceChange(workspace)}
                                                    className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${currentWorkspace?.id === workspace.id ? 'bg-indigo-500/20' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 bg-indigo-500/30 rounded-full flex items-center justify-center text-xs">
                                                            {workspace.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{workspace.name}</p>
                                                            <p className="text-xs text-zinc-400 truncate">{workspace.slug}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                            <div className="border-t border-white/10 mt-2 pt-2">
                                                <button
                                                    onClick={() => setShowNewWorkspaceModal(true)}
                                                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors text-indigo-400"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 border border-dashed border-indigo-400 rounded-full flex items-center justify-center text-xs">
                                                            +
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Create New Workspace</p>
                                                            <p className="text-xs text-zinc-400">Add another workspace</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {subscription && (
                                <div className="hidden md:block">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-sm text-zinc-300 capitalize">
                                            {subscription.plan} Plan
                                        </span>
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
                <div className="mx-auto max-w-7xl space-y-8">
                    {/* Welcome Banner */}
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-8 backdrop-blur-xl">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex-1">
                                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-indigo-300 mb-4">
                                    <span>🚀 Welcome to Zuno</span>
                                </div>
                                
                                <h1 className="text-4xl font-bold tracking-tight mb-4">
                                    {currentWorkspace ? `${currentWorkspace.name} Dashboard` : "Your Workspace Dashboard"}
                                </h1>
                                
                                <p className="text-zinc-400 max-w-2xl">
                                    {currentWorkspace?.description || "Manage your tasks and team members efficiently. Create workspaces, invite members, and collaborate seamlessly."}
                                </p>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                {subscription && (
                                    <div className="inline-flex items-center gap-2 rounded-full bg-green-900/30 border border-green-800/50 px-4 py-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span className="text-sm font-medium text-green-400 capitalize">
                                            {subscription.plan} • {subscription.status}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowNewWorkspaceModal(true)}
                                        className="px-4 py-2 text-sm font-medium rounded-lg border border-indigo-500 bg-indigo-500/20 hover:bg-indigo-500/30 transition-colors"
                                    >
                                        + New Workspace
                                    </button>
                                    {currentWorkspace && (
                                        <button
                                            onClick={() => setShowInviteModal(true)}
                                            className="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                                        >
                                            Invite Member
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Workspace Stats */}
                        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <span className="text-2xl">🏢</span>
                                Workspace Stats
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-zinc-400">Total Workspaces</p>
                                    <p className="text-2xl font-bold text-white">{workspaces.length}</p>
                                </div>
                                {subscription && (
                                    <div>
                                        <p className="text-sm text-zinc-400">Plan Limit</p>
                                        <p className="text-lg font-semibold text-zinc-300">
                                            {subscription.plan === 'free' ? '1 workspace' : 'Unlimited'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subscription Details */}
                        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <span className="text-2xl">📋</span>
                                Subscription
                            </h3>
                            <div className="space-y-4">
                                {subscription ? (
                                    <>
                                        <div>
                                            <p className="text-sm text-zinc-400">Current Plan</p>
                                            <p className="text-2xl font-bold text-indigo-400 capitalize">{subscription.plan}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-zinc-400">Status</p>
                                            <p className="text-lg font-semibold text-green-400 capitalize">{subscription.status}</p>
                                        </div>
                                        {subscription.current_period_end && (
                                            <div>
                                                <p className="text-sm text-zinc-400">Renews</p>
                                                <p className="text-sm text-zinc-300">
                                                    {new Date(subscription.current_period_end).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-zinc-400">No subscription data</p>
                                )}
                            </div>
                        </div>

                        {/* Current Workspace */}
                        {currentWorkspace && (
                            <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <span className="text-2xl">⚡</span>
                                    Current Workspace
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-zinc-400">Workspace Name</p>
                                        <p className="text-lg font-semibold text-white truncate">{currentWorkspace.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-400">Slug</p>
                                        <p className="text-sm text-zinc-300 font-mono">{currentWorkspace.slug}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-400">Created</p>
                                        <p className="text-sm text-zinc-300">
                                            {new Date(currentWorkspace.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Team Members Section */}
                    {currentWorkspace && workspaceMembers.length > 0 && (
                        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="text-2xl">👥</span>
                                    Team Members ({workspaceMembers.length})
                                </h3>
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                                >
                                    + Invite Member
                                </button>
                            </div>
                            
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {workspaceMembers.map((member) => (
                                    <div 
                                        key={member.id} 
                                        className="border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-semibold">
                                                {member.user.full_name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="font-medium">{member.user.full_name}</p>
                                                <p className="text-sm text-zinc-400 truncate">{member.user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                                                member.role === 'owner' 
                                                    ? 'bg-purple-900/30 text-purple-400 border border-purple-800/50'
                                                    : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50'
                                            }`}>
                                                {member.role}
                                            </span>
                                            <span className={`text-xs ${
                                                member.is_active ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {member.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {pendingInvites.length > 0 && (
                        <div className="border border-yellow-500/20 bg-yellow-900/10 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="text-2xl">📨</span>
                                    Pending Invitations ({pendingInvites.length})
                                </h3>
                                <span className="px-3 py-1 text-xs rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-800/50">
                                    Action Required
                                </span>
                            </div>
                            
                            <div className="space-y-4">
                                {pendingInvites.map((invite) => (
                                    <div 
                                        key={invite.id} 
                                        className="border border-yellow-500/20 rounded-xl p-4 bg-yellow-900/5"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-medium">{invite.workspace_name}</p>
                                                <p className="text-sm text-yellow-300/70">Invited by: {invite.invited_by}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                                                invite.role === 'admin' 
                                                    ? 'bg-purple-900/30 text-purple-400 border border-purple-800/50'
                                                    : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50'
                                            }`}>
                                                {invite.role}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-sm">
                                            <div>
                                                <p className="text-zinc-400">Expires: {new Date(invite.expires_at).toLocaleDateString()}</p>
                                            </div>
                                            <Link 
                                                href={`/accept-invite?token=${token}`}
                                                className="px-4 py-2 text-sm font-medium rounded-lg bg-yellow-600 hover:bg-yellow-700 transition-colors"
                                            >
                                                Accept Invitation
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <button 
                            onClick={() => setShowNewWorkspaceModal(true)}
                            className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-indigo-500/50 transition-colors text-left group"
                        >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏗️</div>
                            <h3 className="text-lg font-semibold mb-2">Create Workspace</h3>
                            <p className="text-sm text-zinc-400">Start a new workspace for your team</p>
                        </button>

                        <button 
                            onClick={() => currentWorkspace && setShowInviteModal(true)}
                            className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-indigo-500/50 transition-colors text-left group"
                            disabled={!currentWorkspace}
                        >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👥</div>
                            <h3 className="text-lg font-semibold mb-2">Invite Team</h3>
                            <p className="text-sm text-zinc-400">Add members to your workspace</p>
                        </button>

                        <button className="border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-indigo-500/50 transition-colors text-left group">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚙️</div>
                            <h3 className="text-lg font-semibold mb-2">Settings</h3>
                            <p className="text-sm text-zinc-400">Configure workspace preferences</p>
                        </button>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="border border-red-500/20 bg-red-900/10 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex items-center gap-3 text-red-400 mb-2">
                                <span className="text-xl">⚠️</span>
                                <h3 className="font-semibold">Error Loading Dashboard</h3>
                            </div>
                            <p className="text-red-300 text-sm mb-4">{error}</p>
                            <button
                                onClick={fetchDashboardData}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-red-500/30 hover:bg-red-500/10 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* New Workspace Modal */}
            {showNewWorkspaceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-black/90 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold">Create New Workspace</h3>
                            <button 
                                onClick={() => setShowNewWorkspaceModal(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Workspace Name *
                                </label>
                                <input
                                    type="text"
                                    value={newWorkspaceData.name}
                                    onChange={(e) => setNewWorkspaceData({...newWorkspaceData, name: e.target.value})}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                    placeholder="Enter workspace name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newWorkspaceData.description}
                                    onChange={(e) => setNewWorkspaceData({...newWorkspaceData, description: e.target.value})}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 min-h-[100px]"
                                    placeholder="Describe your workspace"
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleCreateWorkspace}
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {isCreating ? 'Creating...' : 'Create Workspace'}
                                </button>
                                <button
                                    onClick={() => setShowNewWorkspaceModal(false)}
                                    className="px-4 py-3 border border-white/10 hover:bg-white/5 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Member Modal */}
            {showInviteModal && currentWorkspace && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-black/90 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold">Invite to {currentWorkspace.name}</h3>
                            <button 
                                onClick={() => setShowInviteModal(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                    placeholder="Enter email address"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Role *
                                </label>
                                <select
                                    value={inviteData.role}
                                    onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <p className="text-xs text-zinc-500 mt-2">
                                    Admin: Can manage workspace settings and members
                                </p>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleInviteMember}
                                    disabled={isInviting}
                                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {isInviting ? 'Sending...' : 'Send Invitation'}
                                </button>
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="px-4 py-3 border border-white/10 hover:bg-white/5 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}