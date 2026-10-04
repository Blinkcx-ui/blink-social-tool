import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
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

  const currentClientId = dbUser.clientId;
  const isClient = dbUser.role === 'client';

  // FETCH REAL ACCOUNTS
  const linkedAccounts = await prisma.socialAccount.findMany({
    where: currentClientId ? { clientId: currentClientId } : {},
    include: { client: true }
  }).catch(() => []);

  const isConnected = (platform: string) => linkedAccounts.some(acc => acc.platform === platform);
  const getCount = (platform: string) => linkedAccounts.filter(acc => acc.platform === platform).length;

  // FETCH ALL USERS/TENANTS (For Admin View)
  const allClients = await prisma.client.findMany({
    include: { users: true },
    orderBy: { createdAt: 'desc' }
  }).catch(() => []);

  // 1. ACTION: ADD REAL SOCIAL ACCOUNT
  async function addSocialAccount(formData: FormData) {
    'use server';
    const platform = formData.get('platform') as string;
    const platformId = formData.get('platformId') as string;
    const accessToken = formData.get('accessToken') as string;
    const activeClient = currentClientId || 'master-tenant-id'; 

    if (!platform || !platformId) return;

    await prisma.socialAccount.create({
      data: { platform, platformId, clientId: activeClient, accessToken: accessToken || null },
    });
    revalidatePath('/settings');
  }

  // 2. ACTION: DELETE SOCIAL ACCOUNT
  async function deleteAccount(formData: FormData) {
    'use server';
    const accountId = formData.get('accountId') as string;
    if (!accountId) return;

    await prisma.socialAccount.delete({ where: { id: accountId } });
    revalidatePath('/settings');
  }

  // 3. ACTION: SAVE AI MCP API SETTINGS (Console logs for now until you make an AI DB model)
  async function saveAiMcpSettings(formData: FormData) {
    'use server';
    const endpoint = formData.get('endpoint');
    const apiKey = formData.get('apiKey');
    console.log("AI MCP Saved:", { endpoint, apiKey });
    // Future: prisma.systemSettings.create(...)
    revalidatePath('/settings');
  }

  // 4. ACTION: CREATE USER (USERNAME ONLY) & ASSIGN FEATURES
  async function provisionNewUser(formData: FormData) {
    'use server';
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const features = formData.getAll('features') as string[];

    if (!username || !password) return;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creates the Workspace/Tenant with specific features
    const newClient = await prisma.client.create({
      data: {
        name: `${username}'s Workspace`,
        enabledFeatures: features.length > 0 ? features : ['dashboard'],
      },
    });

    // Creates the user linked to that workspace using ONLY username
    await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        role: 'client',
        clientId: newClient.id,
      },
    });
    revalidatePath('/settings');
  }

  return (
    <div className="p-8 bg-[#f8fafc] flex-1 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Settings & Integrations</h1>
          <p className="text-sm text-slate-500 mt-1">Configure AI MCP Engine, social messaging channels, and manage users</p>
        </div>

        {/* --- STATUS GRID --- */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Connection Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3">
            <StatusCard name="AI MCP Engine" status="Active" icon="🤖" active={true} />
            <StatusCard name={`WhatsApp ${getCount('whatsapp') > 0 ? `(${getCount('whatsapp')})` : ''}`} status={isConnected('whatsapp') ? "Connected" : "Not Connected"} icon="💬" active={isConnected('whatsapp')} />
            <StatusCard name={`Instagram ${getCount('instagram') > 0 ? `(${getCount('instagram')})` : ''}`} status={isConnected('instagram') ? "Connected" : "Not Connected"} icon="📸" active={isConnected('instagram')} />
            <StatusCard name={`TikTok ${getCount('tiktok') > 0 ? `(${getCount('tiktok')})` : ''}`} status={isConnected('tiktok') ? "Connected" : "Not Connected"} icon="🎵" active={isConnected('tiktok')} />
            <StatusCard name={`Snapchat ${getCount('snapchat') > 0 ? `(${getCount('snapchat')})` : ''}`} status={isConnected('snapchat') ? "Connected" : "Not Connected"} icon="👻" active={isConnected('snapchat')} />
            <StatusCard name={`Facebook ${getCount('facebook') > 0 ? `(${getCount('facebook')})` : ''}`} status={isConnected('facebook') ? "Connected" : "Not Connected"} icon="📘" active={isConnected('facebook')} />
            <StatusCard name={`X (Twitter) ${getCount('x') > 0 ? `(${getCount('x')})` : ''}`} status={isConnected('x') ? "Connected" : "Not Connected"} icon="𝕏" active={isConnected('x')} />
          </div>
        </div>

        {/* --- AI MCP API ENGINE --- */}
        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm">
          <h2 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-4">🤖 AI Model Context Protocol (MCP) Copilot API</h2>
          <form action={saveAiMcpSettings} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">AI Model Endpoint</label>
              <input type="text" name="endpoint" defaultValue="https://api.openai.com/v1/chat/completions" className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">API Key / Secret</label>
              <input type="password" name="apiKey" placeholder="sk-proj-..." className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-blue-500" />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-md transition shadow-sm h-[42px] cursor-pointer">
              Connect AI API
            </button>
          </form>
        </div>

        {/* --- SOCIAL CHANNELS WIRING --- */}
        <div className="bg-white p-6 rounded-xl border border-pink-300 shadow-sm">
          <h2 className="text-sm font-bold text-pink-600 flex items-center gap-2 mb-4">📱 Connected Social & Messaging Accounts</h2>
          
          <div className="space-y-4">
            {linkedAccounts.length > 0 && (
              <div className="space-y-2 mb-6">
                {linkedAccounts.map((acc) => (
                  <div key={acc.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-md border border-gray-200">
                    <div className="w-32">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-white px-2 py-1 border border-gray-200 rounded">{acc.platform}</span>
                    </div>
                    <input type="text" disabled value={acc.platformId} className="flex-1 p-2 border border-gray-200 rounded text-sm bg-white text-slate-600 cursor-not-allowed" />
                    <input type="text" disabled value={acc.accessToken || 'Token Saved'} className="flex-1 p-2 border border-gray-200 rounded text-sm bg-white text-slate-600 cursor-not-allowed hidden md:block" />
                    <form action={deleteAccount}>
                      <input type="hidden" name="accountId" value={acc.id} />
                      <button type="submit" className="p-2 text-slate-400 hover:text-red-500 transition cursor-pointer" title="Remove Account">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Add New Channel Integration</h3>
              <form action={addSocialAccount} className="flex flex-col sm:flex-row items-center gap-3">
                <select name="platform" required className="w-full sm:w-48 p-2.5 border border-pink-200 rounded-md text-sm bg-white focus:outline-pink-500">
                  <option value="">Select Platform...</option>
                  <option value="whatsapp">WhatsApp Business</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="snapchat">Snapchat</option>
                  <option value="facebook">Facebook</option>
                  <option value="x">X (Twitter)</option>
                </select>
                <input type="text" name="platformId" required placeholder="Account Handle / ID" className="w-full sm:flex-1 p-2.5 border border-pink-200 rounded-md text-sm focus:outline-pink-500" />
                <input type="text" name="accessToken" placeholder="Live Access Token (Optional)" className="w-full sm:flex-1 p-2.5 border border-pink-200 rounded-md text-sm focus:outline-pink-500" />
                <button type="submit" className="w-full sm:w-auto bg-[#d81b60] hover:bg-[#ad1457] text-white text-xs font-bold px-6 py-3 rounded-md transition cursor-pointer shadow-sm">
                  + Add Live Account
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* --- USER CREATION & FEATURE PROVISIONING --- */}
        {!isClient && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Create User & Assign Features</h2>
            <p className="text-xs text-slate-500 mb-6">Provision a new user account (using a username, no email required) and select their platform capabilities.</p>
            
            <form action={provisionNewUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Username</label>
                  <input type="text" name="username" required placeholder="user_john" className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                  <input type="password" name="password" required placeholder="••••••••" className="w-full p-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 focus:outline-orange-500" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Assign Access Features</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['dashboard', 'ticketing', 'post', 'activity', 'report'].map((feat) => (
                    <label key={feat} className="flex items-center gap-2 text-sm text-slate-700 bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition">
                      <input type="checkbox" name="features" value={feat} className="w-4 h-4 accent-orange-500 cursor-pointer" />
                      <span className="font-medium capitalize">{feat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-8 py-3 rounded-lg transition shadow-md cursor-pointer">
                Create User
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

// Reusable UI Components
function StatusCard({ name, status, icon, active = false }: { name: string, status: string, icon: string, active?: boolean }) {
  return (
    <div className={`p-3 border rounded-xl flex flex-col items-center justify-center text-center h-24 ${active ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-gray-50/50'}`}>
      <span className="text-xl mb-1">{icon}</span>
      <span className="text-[10px] font-bold text-slate-700 uppercase mb-0.5 leading-tight">{name}</span>
      <span className={`text-[9px] ${active ? 'text-green-600 font-bold' : 'text-slate-400'}`}>{status}</span>
    </div>
  );
}