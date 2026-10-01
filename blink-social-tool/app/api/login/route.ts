import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. EMERGENCY DEMO BYPASS: Guarantees entry even if database is offline
    if (email === 'demo@blinktolink.com' && password === 'admin123') {
      const response = NextResponse.json({ success: true, redirectUrl: '/' });
      response.cookies.set({ name: 'blink_session', value: 'demo-master-id', path: '/' });
      return response;
    }

    // 2. REAL DATABASE LOGIN
    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 3. BULLETPROOF PASSWORD CHECK (Checks both Plain Text and Hashed)
    const isPlainTextMatch = password.trim() === user.password;
    const isBcryptMatch = await bcrypt.compare(password.trim(), user.password).catch(() => false);

    if (!isPlainTextMatch && !isBcryptMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 4. SUCCESS: Set cookie and unlock dashboard
    const response = NextResponse.json({ success: true, redirectUrl: '/' });
    
    response.cookies.set({
      name: 'blink_session',
      value: user.id,
      httpOnly: false, // Ensures it works seamlessly across Vercel environments
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