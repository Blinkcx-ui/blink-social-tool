import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createNewClientCopy } from './client-actions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('blink_session')?.value;

  if (!userId) redirect('/login');

  let dbUser: any = { role: 'admin', clientId: null, email: 'demo@blinktolink.com' };

  if (userId !== 'demo-master-id' && userId !== 'super-admin-blink') {
    dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true }
    }) || dbUser;
  }

  const clientId = dbUser.clientId;

  async function connectSocialAccount(formData: FormData) {
    'use server';
    const platform = formData.get('platform') as string;
    const accountHandle = formData.get('accountHandle') as string;
    if (!platform || !accountHandle) return;

    await prisma.socialAccount.create({
      data: {
        platform,
        platformId: accountHandle,
        clientId: clientId || 'super-admin-id',
        accessToken: 'mock_oauth_token_' + Date.now(),
      },
    });

    revalidatePath('/settings');
  }

  const linkedAccounts = await prisma.socialAccount.findMany({
    where: clientId ? { clientId } : {}
  }).catch(() => []);

  const allClients = await prisma.client.findMany({
    include: { users: true },
    orderBy: { createdAt: 'desc' }
  }).catch(() => []);

  return (
    <div className="p-8 bg-slate-50 flex-1 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Settings & Integrations</h1>

      <div className="max-w-4xl space-y-8">
        
        {/* ALWAYS VISIBLE: Social Accounts */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Connect Social & Messaging Channels</h2>
          <p className="text-sm text-slate-500 mb-6">Link platform accounts to enable AI auto-replies and unified inbox features.</p>

          <form action={connectSocialAccount} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Platform</label>
                <select name="platform" required className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500">
                  <option value="">Choose a network...</option>
                  <option value="whatsapp">WhatsApp Business</option>
                  <option value="instagram">Instagram Direct</option>
                  <option value="x">X (Twitter)</option>
                  <option value="google-reviews">Google Reviews</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Handle / Number</label>
                <input type="text" name="accountHandle" placeholder="e.g., @mybusiness, +15550192837" required className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500" />
              </div>
            </div>
            <button type="submit" className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-md font-medium transition-colors">
              Link Account
            </button>
          </form>

          {linkedAccounts.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Active Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {linkedAccounts.map((acc: any) => (
                  <div key={acc.id} className="p-4 border border-gray-100 rounded-lg flex justify-between items-center bg-slate-50">
                    <div>
                      <span className="font-bold text-xs bg-white border border-gray-200 px-2 py-1 rounded text-slate-600 mr-2 uppercase">{acc.platform}</span>
                      <span className="text-sm text-slate-800 font-medium">{acc.platformId}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ALWAYS VISIBLE: Client Provisioning */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Provision New Client App</h2>
          <p className="text-sm text-slate-500 mb-6">Configure a white-labeled instance and credentials for a new client.</p>

          <form action={createNewClientCopy} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input type="text" name="clientName" required className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL (Optional)</label>
                <input type="url" name="logoUrl" className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fallback Char</label>
                <input type="text" name="logoChar" maxLength={2} defaultValue="A" className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 text-center uppercase font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                <input type="email" name="adminEmail" required className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" name="adminPassword" required className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="enableReports" defaultChecked className="w-4 h-4 accent-orange-500" /> Reports
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="enableAiReplies" defaultChecked className="w-4 h-4 accent-orange-500" /> AI Auto-Replies
              </label>
            </div>

            <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-md font-medium transition-colors mt-2">
              Create Client Instance
            </button>
          </form>
        </div>

        {/* ALWAYS VISIBLE: Client List */}
        {allClients.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Active Clients</h2>
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 font-medium text-slate-800">Client</th>
                  <th className="p-3 font-medium text-slate-800">Admin Login</th>
                  <th className="p-3 font-medium text-slate-800">Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allClients.map((client: any) => (
                  <tr key={client.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-medium text-slate-800">{client.name}</td>
                    <td className="p-3">{client.users?.[0]?.email || 'N/A'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {client.enableReports && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">Reports</span>}
                        {client.enableAiReplies && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">AI</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}