'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  // Pre-filled with the master bypass credentials
  const [email, setEmail] = useState('demo@blinktolink.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
        setLoading(false);
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError('Network connection failed');
      setLoading(false);
    }
  };

  // 🚨 THE NUCLEAR OPTION: If the standard login fails for ANY reason during the demo, click this.
  const emergencyBypass = () => {
    document.cookie = "blink_session=demo-master-id; path=/; max-age=604800";
    window.location.href = '/';
  };

  return (
    // fixed inset-0 z-50 guarantees it covers the sidebar completely
    <div className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative">
        
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-40 h-14 mb-4 bg-gray-100 rounded flex items-center justify-center font-bold text-slate-400">
             {/* Fallback text just in case the logo.png is missing */}
             LOGO
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Blink Social Manager
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-slate-900"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
           <button 
             onClick={emergencyBypass}
             className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-sm"
           >
             🚨 EMERGENCY DEMO ENTRY
           </button>
           <p className="text-xs text-center text-slate-400 mt-2">Bypasses API and DB entirely. Use if API fails.</p>
        </div>

      </div>
    </div>
  );
}