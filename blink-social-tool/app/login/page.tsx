'use client';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const handleDirectEntry = () => {
    document.cookie = "blink_session=super-admin-blink; path=/; max-age=604800";
    window.location.replace('/');
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900 flex items-center justify-center p-4 w-screen h-screen">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 text-center">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-orange-500 text-white rounded-xl flex items-center justify-center font-bold text-2xl mb-3 shadow-md">
            B
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Blink Social Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">Super Admin Mode Ready</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100 text-left">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Super Admin Credentials</p>
          <p className="text-sm text-slate-800 font-medium">Username: <span className="font-bold">Blink</span></p>
          <p className="text-sm text-slate-800 font-medium">Password: <span className="font-bold">Taha@2030</span></p>
        </div>

        <button 
          onClick={handleDirectEntry}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-base transition-colors shadow-lg cursor-pointer"
        >
          🚀 LAUNCH DEMO DASHBOARD NOW
        </button>
      </div>
    </div>
  );
}