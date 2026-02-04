import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Get token from query parameters
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        
        if (!token) {
            return NextResponse.json(
                { error: 'Invite token is required' },
                { status: 400 }
            );
        }

        // Call the backend API to get invite details
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites/details/${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Failed to fetch invite details' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Invite details fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}