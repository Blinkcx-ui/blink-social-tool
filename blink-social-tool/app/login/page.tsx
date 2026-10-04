import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const error = resolvedParams?.error;

  // Server Action to handle real authentication
  async function handleLogin(formData: FormData) {
    'use server';
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      redirect('/login?error=missing_fields');
    }

    // 1. Check Master Super Admin login override
    if (email === 'admin@blinktolink.com' && password === 'admin123') {
      (await cookies()).set('blink_session', 'super-admin-blink', { path: '/' });
      redirect('/');
    }

    // 2. Query the real user from database
    const user = await prisma.user.findUnique({
      where: { email },
      include: { client: true },
    });

    if (!user) {
      redirect('/login?error=invalid_user');
    }

    // 3. Verify password securely using bcryptjs
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      redirect('/login?error=invalid_password');
    }

    // 4. Set the real user session cookie and redirect to dashboard
    (await cookies()).set('blink_session', user.id, { path: '/' });
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-500 rounded-xl mx-auto flex items-center justify-center text-white font-black text-xl shadow">
            B
          </div>
          <h1 className="text-2xl font-black text-slate-900">Sign in to Blink Social</h1>
          <p className="text-xs text-slate-500">Enter your provisioned client or admin credentials</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl font-medium text-center">
            {error === 'invalid_password' && 'Incorrect password. Please try again.'}
            {error === 'invalid_user' && 'No user found with this email address.'}
            {error === 'missing_fields' && 'Please enter both email and password.'}
          </div>
        )}

        <form action={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="admin@client.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-slate-50 text-slate-900" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-slate-50 text-slate-900" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition text-sm shadow-lg cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}