import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Call backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Login failed' },
                { status: response.status }
            );
        }

        // Create response with cookie
        const res = NextResponse.json(
            { message: 'Login successful' },
            { status: 200 }
        );

        // Set HTTP-only cookie with the access token
        res.cookies.set({
            name: process.env.COOKIE_NAME || 'zuno_auth_token',
            value: data.access_token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 1800, // 30 minutes
            path: '/',
        });

        return res;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}