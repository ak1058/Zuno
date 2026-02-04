import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Get the auth token from cookies
        const token = request.cookies.get(process.env.COOKIE_NAME || 'zuno_auth_token')?.value;
        
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { workspace_id, email, role } = body;

        // Validate input
        if (!workspace_id || !email || !role) {
            return NextResponse.json(
                { error: 'Workspace ID, email, and role are required' },
                { status: 400 }
            );
        }

        if (!['admin', 'member'].includes(role)) {
            return NextResponse.json(
                { error: 'Role must be either "admin" or "member"' },
                { status: 400 }
            );
        }

        // Call the backend API with bearer token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspace_id}/invite`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, role }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Failed to invite member' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Invite member error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}