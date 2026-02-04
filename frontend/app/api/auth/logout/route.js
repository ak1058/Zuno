import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const res = NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
        );

        // Clear the auth cookie
        res.cookies.set({
            name: process.env.COOKIE_NAME || 'zuno_auth_token',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        return res;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}