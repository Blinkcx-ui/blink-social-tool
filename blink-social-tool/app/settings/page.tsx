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

  let dbUser: any = { role: 'admin', clientId: null, email: 'admin@blinktolink.com' };

  if (userId !== 'demo-master-id' && userId !== 'super-admin-blink') {
    dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true }
    }) || dbUser;
  }

  const isClient = dbUser.role === 'client';
  const currentClientId = dbUser.clientId;

  const allClients = await prisma.client.findMany({
    include: { users: true, socialAccounts: true },
    orderBy: { createdAt: 'desc' }
  }).catch(() => []);

  // Server Action: Delete a client tenant and clean up users/accounts
  async function deleteClient(formData: FormData) {
    'use server';
    const clientId = formData.get('clientId') as string;
    if (!clientId) return;

    try {
      await prisma.client.delete({
        where: { id: clientId },
      });
      revalidatePath('/settings');
    } catch (err) {
      console.error('Delete client error:', err);
    }
  }

  // Server Action: Insert real social account credentials (NO MOCK TOKENS)
  async function connectRealAccount(formData: FormData) {
    'use server';
    const platform = formData.get('platform') as string;
    const platformId = formData.get('platformId') as string;
    const accessToken = formData.get('accessToken') as string;
    const assignedClientId = formData.get('targetClientId') as string || currentClientId;

    if (!platform || !platformId || !assignedClientId) return;

    await prisma.socialAccount.create({
      data: {
        platform,
        platformId, // Saves exact user input
        clientId: assignedClientId,
        accessToken: accessToken || null, // Saves exact user input (no fake appended strings)
      },
    });

    revalidatePath('/settings');
  }

  // Server Action: Delete a connected social account
  async function removeAccount(formData: FormData) {
    'use server';
    const accountId = formData.get('accountId') as string;
    if (!accountId) return;

    await prisma.socialAccount.delete({
      where: { id: accountId },
    });

    revalidatePath('/settings');
  }

  const linkedAccounts = await prisma.socialAccount.findMany({
    where: isClient && currentClientId ? { clientId: currentClientId } : {},
    include: { client: true }
  }).catch(() => []);

  return (
    <div className="p-8 bg-slate-50 flex-1 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Settings & Integrations</h1>

      <div className="max-w-5xl space-y-8">
        
        {/* Real Account Connection Form */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Connect Real Social Account</h2>
          <p className="text-sm text-slate-500 mb-6">Input live business handles and access tokens for your active tenant.</p>

          <form action={connectRealAccount} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {!isClient && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Client</label>
                  <select name="targetClientId" required className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500">
                    <option value="">Select client...</option>
                    {allClients.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Platform</label>
                <select name="platform" required className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500">
                  <option value="">Select platform...</option>
                  <option value="whatsapp">WhatsApp Business</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="x">X (Twitter)</option>
                  <option value="facebook">Facebook</option>
                  <option value="snapchat">Snapchat</option>
                  <option value="google-reviews">Google Reviews</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Handle / ID</label>
                <input type="text" name="platformId" placeholder="e.g. @brand_handle or ID" required className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Access Token (Optional)</label>
                <input type="text" name="accessToken" placeholder="Live API token..." className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500" />
              </div>
            </div>

            <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-lg text-sm transition cursor-pointer shadow">
              + Add Live Account
            </button>
          </form>

          {/* Connected Accounts List */}
          {linkedAccounts.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Connected Accounts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {linkedAccounts.map((acc: any) => (
                  <div key={acc.id} className="p-4 border border-gray-200 rounded-lg flex flex-col justify-between bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-[10px] bg-white border border-gray-200 px-2 py-1 rounded text-slate-600 uppercase tracking-wider">{acc.platform}</span>
                      <form action={removeAccount}>
                        <input type="hidden" name="accountId" value={acc.id} />
                        <button type="submit" className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer transition">Remove</button>
                      </form>
                    </div>
                    <div>
                      <p className="text-sm text-slate-800 font-bold break-all">{acc.platformId}</p>
                      {acc.accessToken && (
                        <p className="text-[10px] text-slate-400 mt-1 truncate">Token saved</p>
                      )}
                      {!isClient && acc.client && (
                        <p className="text-xs text-slate-500 mt-1">Client: {acc.client.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Client Provisioning */}
        {!isClient && (
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Provision New Client App & Channels</h2>
            <p className="text-sm text-slate-500 mb-6">Create a user account, assign tool features, and provision platform access.</p>

            <form action={createNewClientCopy} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                  <input type="text" name="clientName" required placeholder="e.g. Acme Corp" className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email (Login)</label>
                  <input type="email" name="adminEmail" required placeholder="admin@acme.com" className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" name="adminPassword" required placeholder="••••••••" className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500" />
                </div>
              </div>

              {/* Tool Features */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Assign Tool Features</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['dashboard', 'ticketing', 'post', 'activity', 'report'].map((feat) => (
                    <label key={feat} className="flex items-center gap-2 text-sm text-slate-700 bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer">
                      <input type="checkbox" name="features" value={feat} defaultChecked className="w-4 h-4 accent-orange-500" />
                      <span className="font-medium capitalize">{feat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Social Channels */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Assign Social Channels</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['whatsapp', 'instagram', 'tiktok', 'snapchat', 'facebook', 'x'].map((ch) => (
                    <label key={ch} className="flex items-center gap-2 text-sm text-slate-700 bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer">
                      <input type="checkbox" name="platforms" value={ch} defaultChecked className="w-4 h-4 accent-orange-500" />
                      <span className="font-medium capitalize">{ch}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white px-6 py-3.5 rounded-md font-bold transition-colors mt-4 cursor-pointer shadow">
                Create User & Provision Platform Copy
              </button>
            </form>
          </div>
        )}

        {/* Client List with Delete Tenant Action */}
        {!isClient && allClients.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Active Clients & Tenant Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-3 font-medium text-slate-800">Client</th>
                    <th className="p-3 font-medium text-slate-800">Admin Login</th>
                    <th className="p-3 font-medium text-slate-800">Features</th>
                    <th className="p-3 font-medium text-slate-800 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allClients.map((client: any) => (
                    <tr key={client.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-medium text-slate-800">{client.name}</td>
                      <td className="p-3">{client.users?.[0]?.email || 'N/A'}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {client.enabledFeatures?.map((f: string) => (
                            <span key={f} className="bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{f}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <form action={deleteClient} className="inline">
                          <input type="hidden" name="clientId" value={client.id} />
                          <button 
                            type="submit" 
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Delete Tenant
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}