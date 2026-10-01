'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('Blink');
  const [password, setPassword] = useState('Taha@2030');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        document.cookie = "blink_session=super-admin-blink; path=/; max-age=604800";
        window.location.assign('/');
      } else {
        setError(data.error || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      setError('Network connection error');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-500 text-white rounded-xl flex items-center justify-center font-bold text-2xl mb-3 shadow-md">
            B
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Blink Social Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">Super Admin Authentication</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-slate-900 focus:outline-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-slate-900 focus:outline-orange-500"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-lg font-bold text-sm transition-colors shadow-sm cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}