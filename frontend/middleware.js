import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('zuno_auth_token');
    const { pathname } = request.nextUrl;

    // Protected routes
    const protectedRoutes = ['/dashboard'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Auth routes (should redirect to dashboard if already logged in)
    const authRoutes = ['/login', '/register', '/get-started'];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // If accessing protected route without token, redirect to login
    if (isProtectedRoute && !token) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // If accessing auth route with token, redirect to dashboard
    if (isAuthRoute && token) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register', '/get-started'],
};