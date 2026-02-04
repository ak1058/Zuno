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

        // Call the backend API with bearer token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/current-plan-details`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Failed to fetch subscription plan' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Subscription plan fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}