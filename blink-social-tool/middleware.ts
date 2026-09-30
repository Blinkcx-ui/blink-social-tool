import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // HARD BYPASS: Instantly allow ALL API routes, static files, and public pages
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') || // allows images, favicons, etc.
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  // Check for the NextAuth session cookie
  const sessionToken = 
    req.cookies.get('next-auth.session-token')?.value || 
    req.cookies.get('__Secure-next-auth.session-token')?.value;

  // If no session exists and they are trying to access a protected page, redirect to login
  if (!sessionToken && pathname !== '/login') {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Config matcher that explicitly avoids matching API routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};