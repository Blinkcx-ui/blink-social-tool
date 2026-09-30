import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. EXPLICIT BYPASS: Never block API routes, Next.js static files, or the login page itself
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') || 
    pathname === '/login' || 
    pathname === '/logo.png' || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Check for a valid NextAuth session token for all other pages (Dashboard, Inbox, etc.)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 3. If no session token is found, redirect to the login page
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // 4. Allow authenticated users to proceed to the page
  return NextResponse.next();
}