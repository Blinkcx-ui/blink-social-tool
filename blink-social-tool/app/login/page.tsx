'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@blinktolink.com');
  const [password, setPassword] = useState('admin123');

  // Direct forced jump
  const emergencyBypass = () => {
    document.cookie = "blink_session=demo-master-id; path=/; max-age=604800";
    window.location.replace('/');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-40 h-14 mb-4 bg-gray-100 rounded flex items-center justify-center font-bold text-slate-400">
             LOGO
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Blink Social Manager
          </h1>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} readOnly className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} readOnly className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-slate-900" />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
             <button 
               onClick={emergencyBypass}
               className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg cursor-pointer"
             >
               🚨 EMERGENCY DEMO ENTRY
             </button>
             <p className="text-xs text-center text-slate-400 mt-2">Click this to bypass login and open the dashboard immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
}