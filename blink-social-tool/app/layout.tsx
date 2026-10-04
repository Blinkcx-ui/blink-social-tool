import './globals.css';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen w-screen bg-slate-50 antialiased overflow-hidden m-0 p-0 flex">
        {/* Permanent Navigation Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col text-slate-300 shadow-xl select-none">
          {/* Brand Header with Company Logo */}
          <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 relative flex items-center justify-center bg-white/5 rounded-xl p-1 border border-white/10">
              <Image 
                src="/logo.png" 
                alt="Blink to Link" 
                fill 
                className="object-contain p-1"
                priority 
              />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-white text-sm tracking-tight truncate">Blink Social</h1>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase">Super Admin Active</p>
            </div>
          </div>

          {/* Full Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
            
            <Link href="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors">
              <span>📊</span>
              <span>Dashboard</span>
            </Link>

            <Link href="/inbox" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors">
              <span>💬</span>
              <span>Unified Inbox</span>
            </Link>

            <Link href="/tickets" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors">
              <span>🎫</span>
              <span>Tickets</span>
            </Link>

            <Link href="/posts" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors">
              <span>📝</span>
              <span>Posts</span>
            </Link>

            <Link href="/reports" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors">
              <span>📈</span>
              <span>Reports</span>
            </Link>

            <Link href="/activity" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors">
              <span>📋</span>
              <span>Activity Log</span>
            </Link>

            <div className="pt-4">
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">System</p>
              <Link href="/settings" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors">
                <span>⚙️</span>
                <span>Settings</span>
              </Link>
            </div>
          </nav>

          {/* Footer User Profile Status */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
              BK
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">Blink Admin</p>
              <p className="text-[10px] text-slate-400 truncate">Super Admin Mode</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 h-screen overflow-y-auto bg-slate-50 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}