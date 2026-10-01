import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let username = '';
    let password = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      username = body.username || body.email;
      password = body.password;
    } else {
      const formData = await request.formData();
      username = formData.get('username') as string;
      password = formData.get('password') as string;
    }

    if ((username === 'Blink' || username === 'blink') && password === 'Taha@2030') {
      const response = NextResponse.redirect(new URL('/', request.url), { status: 302 });
      
      response.cookies.set({
        name: 'blink_session',
        value: 'super-admin-blink',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}