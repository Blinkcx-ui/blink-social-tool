import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
  const cookieStore = cookies();
  const userId = cookieStore.get('blink_session')?.value;

  let dbUser: any = { role: 'admin', clientId: null, email: 'demo@blinktolink.com' };

  try {
    if (userId && userId !== 'demo-master-id' && userId !== 'super-admin-blink') {
      const found = await prisma.user.findUnique({
        where: { id: userId },
        include: { client: true }
      });
      if (found) dbUser = found;
    }
  } catch (e) {
    dbUser = { role: 'admin', clientId: null, email: 'demo@blinktolink.com' };
  }

  const isClient = dbUser.role === 'client';
  const clientId = dbUser.clientId;

  async function connectSocialAccount(formData: FormData) {
    'use server';
    const platform = formData.get('platform') as string;
    const accountHandle = formData.get('accountHandle') as string;

    if (!platform || !accountHandle) return;

    try {
      await prisma.socialAccount.create({
        data: {
          platform,
          platformId: accountHandle,
          clientId: clientId || 'super-admin-id',
          accessToken: 'mock_oauth_token_' + Date.now(),
        },
      });
    } catch (err) {
      console.error(err);
    }

    revalidatePath('/settings');
    revalidatePath('/');
  }

  async function createNewClientCopy(formData: FormData) {
    'use server';
    const clientName = formData.get('clientName') as string;
    const adminEmail = formData.get('adminEmail') as string;
    const adminPassword = formData.get('adminPassword') as string;
    const logoUrl = formData.get('logoUrl') as string;
    const logoChar = formData.get('logoChar') as string || 'A';

    if (!clientName || !adminEmail) return;

    try {
      await prisma.client.create({
        data: {
          name: clientName,
          logoUrl: logoUrl || null,
          logoChar: logoChar,
          enableReports: true,
          enableAiReplies: true,
          users: {
            create: {
              email: adminEmail,
              password: adminPassword,
              role: 'client',
            }
          }
        }
      });
    } catch (e) {
      console.error(e);
    }

    revalidatePath('/settings');
  }

  let linkedAccounts: any[] = [];
  let allClients: any[] = [];

  try {
    if (clientId) {
      linkedAccounts = await prisma.socialAccount.findMany({ where: { clientId } });
    }
    if (!isClient) {
      allClients = await prisma.client.findMany({
        include: { users: true },
        orderBy: { createdAt: 'desc' }
      });
    }
  } catch (e) {
    linkedAccounts = [];
    allClients = [];
  }

  return (
    <div className="p-8 bg-slate-50 flex-1 h-full overflow-y-auto w-full">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        {isClient ? 'Channel Settings' : 'Settings & Client Management'}
      </h1>

      <div className="max-w-3xl space-y-6">
        {isClient ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Connect Social & Messaging Channels</h2>
            <p className="text-sm text-slate-500 mb-6">
              Link multiple accounts per platform to centralize your communications and AI automated workflows.
            </p>

            <form action={connectSocialAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Platform</label>
                <select
                  name="platform"
                  required
                  className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500"
                >
                  <option value="">Choose a network...</option>
                  <option value="whatsapp">WhatsApp Business</option>
                  <option value="instagram">Instagram Direct</option>
                  <option value="tiktok">TikTok</option>
                  <option value="x">X (Twitter)</option>
                  <option value="snapchat">Snapchat</option>
                  <option value="google-reviews">Google Reviews</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Handle, Username, or Phone Number</label>
                <input
                  type="text"
                  name="accountHandle"
                  placeholder="e.g., @mybusiness, +15550192837"
                  required
                  className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-medium transition-colors cursor-pointer"
              >
                Link Account
              </button>
            </form>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Linked Channels ({linkedAccounts.length})</h3>
              {linkedAccounts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {linkedAccounts.map((acc) => (
                    <div key={acc.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-medium uppercase text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 mr-3">
                          {acc.platform}
                        </span>
                        <span className="text-sm text-slate-800 font-medium">{acc.platformId}</span>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">Connected</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No social accounts connected yet.</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Provision New Client App</h2>
              <p className="text-sm text-slate-500 mb-6">
                Instantly configure a white-labeled instance, login credentials, and features for a new client.
              </p>

              <form action={createNewClientCopy} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client Company Name</label>
                    <input type="text" name="clientName" placeholder="e.g., Acme Corp" required className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL (Optional)</label>
                    <input type="url" name="logoUrl" placeholder="https://example.com/logo.png" className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Logo Char (Fallback)</label>
                    <input type="text" name="logoChar" maxLength={2} placeholder="A" className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 text-center uppercase font-bold focus:outline-orange-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                    <input type="email" name="adminEmail" placeholder="client@acme.com" required className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input type="password" name="adminPassword" placeholder="••••••••" required className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-md font-medium transition-colors mt-4 cursor-pointer">
                  Create Client Instance
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Active Clients</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-3 font-medium text-slate-800">Client</th>
                      <th className="p-3 font-medium text-slate-800">Admin Login</th>
                      <th className="p-3 font-medium text-slate-800">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allClients.map((client: any) => (
                      <tr key={client.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-medium text-slate-800">{client.name}</td>
                        <td className="p-3">{client.users?.[0]?.email || 'No user setup'}</td>
                        <td className="p-3">{new Date(client.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}