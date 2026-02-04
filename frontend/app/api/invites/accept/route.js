import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { token, full_name, password } = body;

        // Validate input
        if (!token) {
            return NextResponse.json(
                { error: 'Invite token is required' },
                { status: 400 }
            );
        }

        // Prepare request body
        const requestBody = { token };
        if (full_name) requestBody.full_name = full_name;
        if (password) requestBody.password = password;

        // Call the backend API to accept invitation
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Failed to accept invitation' },
                { status: response.status }
            );
        }

        // Create response with cookie if access_token is present
        const res = NextResponse.json(data, { status: 200 });

        if (data.access_token) {
            // Set HTTP-only cookie with the access token
            res.cookies.set({
                name: process.env.COOKIE_NAME || 'zuno_auth_token',
                value: data.access_token,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: data.expires_in || (parseInt(process.env.COOKIE_MAX_AGE) || 1800),
                path: '/',
            });
        }

        return res;
    } catch (error) {
        console.error('Accept invitation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}