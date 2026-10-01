export const dynamic = 'force-dynamic';

export default function LoginPage() {
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

        {/* Using a native HTML POST form to avoid all CSP/eval blocks */}
        <form action="/api/login" method="POST" className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              name="username"
              defaultValue="Blink"
              required
              className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-slate-900 focus:outline-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              defaultValue="Taha@2030"
              required
              className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-slate-900 focus:outline-orange-500"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-lg font-bold text-sm transition-colors shadow-sm cursor-pointer"
          >
            Sign In (Secure Server Post)
          </button>
        </form>
      </div>
    </div>
  );
}