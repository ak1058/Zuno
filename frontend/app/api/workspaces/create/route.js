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
        const { name, description } = body;

        // Validate input
        if (!name) {
            return NextResponse.json(
                { error: 'Workspace name is required' },
                { status: 400 }
            );
        }

        // Call the backend API with bearer token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Failed to create workspace' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Workspace creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}