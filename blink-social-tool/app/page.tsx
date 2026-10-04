import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('blink_session')?.value;

  if (!userId) redirect('/login');

  let dbUser: any = { role: 'admin', clientId: null };
  if (userId !== 'demo-master-id' && userId !== 'super-admin-blink') {
    dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true }
    }) || dbUser;
  }

  const isSuperAdmin = userId === 'super-admin-blink' || userId === 'demo-master-id';
  const currentClientId = dbUser.clientId;

  // FETCH REAL CONNECTED ACCOUNTS FROM DATABASE FOR THIS TENANT
  const linkedAccounts = await prisma.socialAccount.findMany({
    where: !isSuperAdmin && currentClientId ? { clientId: currentClientId } : {},
  }).catch(() => []);

  return (
    <div className="p-8 bg-[#f8fafc] flex-1 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header with Real Logo */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Real Company Logo */}
            <div className="w-36 h-12 relative flex items-center">
              <Image 
                src="/logo.png" 
                alt="Blink to Link" 
                fill 
                className="object-contain object-left"
                priority 
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800">
                {isSuperAdmin ? 'Welcome, Super Admin!' : `Welcome, ${dbUser.client?.name || 'Workspace User'}`}
              </h1>
              <p className="text-xs text-slate-500">All platform functions, reports, and tickets are fully active.</p>
            </div>
          </div>
          
          {isSuperAdmin && (
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200">
              Super Admin Mode Active
            </span>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Pending Messages */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Messages</h3>
            <p className="text-3xl font-black text-slate-800">0</p>
            <p className="text-xs text-slate-500 mt-1">Requires attention</p>
          </div>

          {/* AI Handled Today */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Handled Today</h3>
            <p className="text-3xl font-black text-slate-800">0</p>
            <p className="text-xs text-slate-500 mt-1">Automated replies sent</p>
          </div>

          {/* Connected Accounts (REAL DB DATA) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Connected Accounts</h3>
            {linkedAccounts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {linkedAccounts.map((acc) => (
                  <span 
                    key={acc.id} 
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm"
                  >
                    {acc.platform} ({acc.platformId})
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No accounts connected yet. Go to Settings to add live channels.</p>
            )}
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <Link href="/tickets" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-500 transition shadow-sm group">
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition flex items-center justify-between">
              Support Tickets &rarr;
            </h3>
            <p className="text-xs text-slate-500 mt-1">Manage inquiries and live conversations.</p>
          </Link>

          <Link href="/reports" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-500 transition shadow-sm group">
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition flex items-center justify-between">
              Reports & Analytics &rarr;
            </h3>
            <p className="text-xs text-slate-500 mt-1">View analytics and export performance data.</p>
          </Link>

          <Link href="/settings" className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-500 transition shadow-sm group">
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition flex items-center justify-between">
              Settings & Integrations &rarr;
            </h3>
            <p className="text-xs text-slate-500 mt-1">Manage channels, AI MCP keys, and client instances.</p>
          </Link>
        </div>

      </div>
    </div>
  );
}