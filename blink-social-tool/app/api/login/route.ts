import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = body.email || body.username;
    const { password } = body;

    // 1. SUPER ADMIN BYPASS: Instant entry for Blink / Taha@2030
    if (identifier === 'Blink' && password === 'Taha@2030') {
      const response = NextResponse.json({ success: true, redirectUrl: '/' });
      response.cookies.set({
        name: 'blink_session',
        value: 'super-admin-blink',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }

    // 2. EMERGENCY DEMO BYPASS
    if (identifier === 'demo@blinktolink.com' && password === 'admin123') {
      const response = NextResponse.json({ success: true, redirectUrl: '/' });
      response.cookies.set({ name: 'blink_session', value: 'demo-master-id', path: '/' });
      return response;
    }

    // 3. REAL DATABASE LOGIN
    const user = await prisma.user.findUnique({
      where: { email: identifier?.trim() },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // 4. BULLETPROOF PASSWORD CHECK
    const isPlainTextMatch = password.trim() === user.password;
    const isBcryptMatch = await bcrypt.compare(password.trim(), user.password).catch(() => false);

    if (!isPlainTextMatch && !isBcryptMatch) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // 5. SUCCESS: Set cookie and unlock dashboard
    const response = NextResponse.json({ success: true, redirectUrl: '/' });
    
    response.cookies.set({
      name: 'blink_session',
      value: user.id,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, 
    });

    return response;
  } catch (error) {
    console.error('Login backend error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}