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
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      redirect('/login?error=missing_fields');
    }

    // 1. Check Master Super Admin login override
    if (username === 'admin' && password === 'admin123') {
      (await cookies()).set('blink_session', 'super-admin-blink', { path: '/' });
      redirect('/');
    }

    // 2. Query the real user from database using username
    const user = await prisma.user.findUnique({
      where: { username },
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
    <div className="min-h-screen w-full flex bg-slate-50">
      
      {/* LEFT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10 bg-white">
        <div className="p-10 rounded-2xl max-w-md w-full space-y-8">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg">
              B
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-sm text-slate-500 font-medium">Sign in to your workspace</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error === 'invalid_password' && 'Incorrect password. Please try again.'}
              {error === 'invalid_user' && 'No user found with this username.'}
              {error === 'missing_fields' && 'Please enter both username and password.'}
            </div>
          )}

          <form action={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Username</label>
              <input 
                type="text" 
                name="username" 
                required 
                placeholder="e.g. user_john"
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-slate-50 text-slate-900 transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                placeholder="••••••••"
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-slate-50 text-slate-900 transition-all" 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors text-sm shadow-lg cursor-pointer mt-2"
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE: Animated "Video" Showcase */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-slate-900">
        
        {/* CSS for the moving fluid video effect */}
        <style>{`
          @keyframes fluidBackground {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-fluid {
            background-size: 200% 200%;
            animation: fluidBackground 15s ease infinite;
          }
        `}</style>

        {/* The Animated Background */}
        <div className="absolute inset-0 w-full h-full animate-fluid bg-gradient-to-br from-slate-900 via-orange-900/40 to-slate-900"></div>
        
        {/* Abstract Glowing Orbs for extra motion */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Branding & Welcome Text */}
        <div className="relative z-10 p-12 max-w-lg text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-white text-xs font-bold uppercase tracking-widest mb-6 shadow-2xl">
            Blink Social
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-6 drop-shadow-lg">
            Your Unified <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
              Social Media Manager
            </span>
          </h2>
          <p className="text-slate-300 text-lg font-medium leading-relaxed drop-shadow">
            Connect WhatsApp, Instagram, TikTok, and more. Manage all your conversations, ticketing, and AI auto-replies from one powerful dashboard.
          </p>
        </div>
      </div>

    </div>
  );
}