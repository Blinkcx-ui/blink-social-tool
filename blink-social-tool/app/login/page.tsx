"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-40 h-14 mb-4">
            <Image src="/logo.png" alt="Logo" fill style={{ objectFit: "contain" }} priority />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Blink Social Manager</h1>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-6 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border rounded-lg bg-gray-50 text-slate-900" placeholder="admin@blinktolink.com" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border rounded-lg bg-gray-50 text-slate-900" placeholder="••••••••" />
          <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white px-6 py-3 rounded-lg disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}