import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Protected admin routes
    const adminRoutes = ['/dashboard', '/admin'];
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    // Auth routes that should redirect if user is logged in
    const authRoutes = ['/auth'];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Get user from cookies
    const userCookie = request.cookies.get('currentUser');
    let currentUser = null;
    
    if (userCookie) {
        try {
            currentUser = JSON.parse(userCookie.value);
        } catch (e) {
            console.error('Error parsing user cookie:', e);
        }
    }

    // Check if user is logged in
    const isLoggedIn = !!currentUser;

    // Check if user is admin
    const isAdmin = currentUser?.role === 'seller';

    // Redirect logged-in users away from auth pages
    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Protect admin routes
    if (isAdminRoute && (!isLoggedIn || !isAdmin)) {
        return NextResponse.redirect(new URL('/auth', request.url));
    }

    // Add security headers
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return response;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/auth/:path*',
        '/api/orders/:path*',
        '/api/products/:path*'
    ]
}; 