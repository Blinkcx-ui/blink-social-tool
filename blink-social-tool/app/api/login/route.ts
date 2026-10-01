import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = body.email || body.username;
    const { password } = body;

    // SUPER ADMIN MATCH: Blink / Taha@2030
    if ((identifier === 'Blink' || identifier === 'blink') && password === 'Taha@2030') {
      const response = NextResponse.json({ success: true, redirectUrl: '/' });
      
      // Set the session cookie globally
      response.cookies.set({
        name: 'blink_session',
        value: 'super-admin-blink',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        secure: false, // Set to false to avoid strict HTTPS protocol blocks on custom domains during demos
      });

      return response;
    }

    // Standard database lookup fallback
    const user = await prisma.user.findUnique({
      where: { email: identifier?.trim() },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const isPlainTextMatch = password.trim() === user.password;
    const isBcryptMatch = await bcrypt.compare(password.trim(), user.password).catch(() => false);

    if (!isPlainTextMatch && !isBcryptMatch) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, redirectUrl: '/' });
    response.cookies.set({
      name: 'blink_session',
      value: user.id,
      httpOnly: false,
      secure: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, 
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication service error' }, { status: 500 });
  }
}