import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { createNewClientCopy } from './client-actions';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // Identify who is logged in
  const userEmail = session.user?.email || '';
  const dbUser = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { client: true }
  });

  const isClient = dbUser?.role === 'client';
  const clientId = dbUser?.clientId;

  // 1. Client Server Action: Link social accounts securely
  async function connectSocialAccount(formData: FormData) {
    'use server';
    const platform = formData.get('platform') as string;
    const accountHandle = formData.get('accountHandle') as string;

    if (!platform || !accountHandle || !clientId) return;

    await prisma.socialAccount.create({
      data: {
        platform,
        platformId: accountHandle,
        clientId: clientId,
        accessToken: 'mock_oauth_token_' + Date.now(),
      },
    });

    revalidatePath('/settings');
    revalidatePath('/');
  }

  // 2. Admin Server Action: Legacy manual dummy account (fallback)
  async function addAccount(formData: FormData) {
    'use server';
    const platform = formData.get('platform') as string;
    const platformId = formData.get('platformId') as string;
    if (!platform || !platformId) return;

    const client = await prisma.client.findFirst();
    if (!client) return;

    await prisma.socialAccount.create({
      data: { platform, platformId, clientId: client.id, accessToken: 'dummy_oauth_token_123' }
    });

    revalidatePath('/');
    revalidatePath('/settings');
  }

  // Fetch linked accounts for the current client view
  const linkedAccounts = clientId ? await prisma.socialAccount.findMany({
    where: { clientId: clientId }
  }) : [];

  // Fetch all clients if user is viewing admin mode
  const allClients = !isClient ? await prisma.client.findMany({
    include: { users: true },
    orderBy: { createdAt: 'desc' }
  }) : [];

  return (
    <div className="p-8 bg-brand-light flex-1 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        {isClient ? 'Channel Settings' : 'Settings & Client Management'}
      </h1>
      
      <div className="max-w-3xl space-y-6">
        
        {/* CLIENT VIEW: Multi-Account Social Connector */}
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
                  className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-brand-orange"
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
                  className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-brand-orange"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Link Account
              </button>
            </form>

            {/* List of currently linked channels for this client */}
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
          /* ADMIN VIEW: Provisioner Forms & Global Controls */
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
                    <input type="text" name="clientName" placeholder="e.g., Acme Corp" required className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL (Optional)</label>
                    <input type="url" name="logoUrl" placeholder="https://example.com/logo.png" className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Logo Char (Fallback)</label>
                    <input type="text" name="logoChar" maxLength={2} placeholder="A" className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 text-center uppercase font-bold focus:outline-brand-orange" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                    <input type="email" name="adminEmail" placeholder="client@acme.com" required className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input type="password" name="adminPassword" placeholder="••••••••" required className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-brand-orange" />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-semibold text-slate-800 mb-3">Enabled Features</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" name="enableReports" defaultChecked className="w-4 h-4 accent-brand-orange" />
                      Enable Performance & Reports
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" name="enableAiReplies" defaultChecked className="w-4 h-4 accent-brand-orange" />
                      Enable AI Auto-Replies
                    </label>
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-md font-medium transition-colors mt-4">
                  Create Client Instance
                </button>
              </form>
            </div>

            {/* Active Clients Table */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Active Clients</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-3 font-medium text-slate-800">Client</th>
                      <th className="p-3 font-medium text-slate-800">Admin Login</th>
                      <th className="p-3 font-medium text-slate-800">Features</th>
                      <th className="p-3 font-medium text-slate-800">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allClients.map(client => (
                      <tr key={client.id} className="hover:bg-gray-50/50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {client.logoUrl ? (
                              <img src={client.logoUrl} alt="logo" className="w-8 h-8 rounded-md object-cover" />
                            ) : (
                              <div className="w-8 h-8 bg-brand-orange text-white rounded-md flex items-center justify-center font-bold">
                                {client.logoChar}
                              </div>
                            )}
                            <span className="font-medium text-slate-800">{client.name}</span>
                          </div>
                        </td>
                        <td className="p-3">{client.users[0]?.email || 'No user setup'}</td>
                        <td className="p-3">
                          <div className="flex gap-1 flex-wrap">
                            {client.enableReports && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 text-xs">Reports</span>}
                            {client.enableAiReplies && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 text-xs">AI</span>}
                          </div>
                        </td>
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