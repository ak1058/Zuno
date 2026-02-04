import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Get the auth token from cookies
        const token = request.cookies.get(process.env.COOKIE_NAME || 'zuno_auth_token')?.value;
        
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get workspace_id from query parameters
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspace_id');
        
        if (!workspaceId) {
            return NextResponse.json(
                { error: 'Workspace ID is required' },
                { status: 400 }
            );
        }

        // Call the backend API with bearer token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/members`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Failed to fetch workspace members' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Workspace members fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}