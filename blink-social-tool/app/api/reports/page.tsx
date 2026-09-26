import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DownloadButton from './DownloadButton';

export const revalidate = 0;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  // 1. Verify Authentication Session
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userEmail = session.user?.email || '';
  const dbUser = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { client: true }
  });

  // If reports feature is disabled for this client instance, block access
  if (dbUser?.client && !dbUser.client.enableReports) {
    return (
      <div className="p-8 bg-brand-light flex-1 h-full">
        <h1 className="text-2xl font-bold text-slate-800">Reports Unavailable</h1>
        <p className="text-slate-500 mt-2">Performance reporting is disabled for your subscription plan.</p>
      </div>
    );
  }

  const clientId = dbUser?.clientId;
  const resolvedParams = await searchParams;
  const selectedPlatform = resolvedParams.platform;

  // 2. Fetch unique platforms from connected accounts for this specific client only
  const connectedAccounts = await prisma.socialAccount.findMany({
    where: { clientId: clientId },
    select: { platform: true },
    distinct: ['platform'],
  });
  const availablePlatforms = connectedAccounts.map((acc) => acc.platform);

  // 3. Build tenant-isolated filters scoped to this client's social accounts
  const baseAccountFilter = { clientId: clientId };
  const platformAccountFilter = selectedPlatform 
    ? { clientId: clientId, platform: selectedPlatform } 
    : baseAccountFilter;

  const messageFilter = { conversation: { socialAccount: platformAccountFilter } };
  const conversationFilter = { socialAccount: platformAccountFilter };

  const totalMessages = await prisma.message.count({ where: messageFilter });
  const aiMessages = await prisma.message.count({ 
    where: { senderType: 'ai', ...messageFilter } 
  });
  const humanMessages = await prisma.message.count({ 
    where: { senderType: 'human', ...messageFilter } 
  });
  const customerMessages = await prisma.message.count({ 
    where: { senderType: 'customer', ...messageFilter } 
  });
  
  const totalConversations = await prisma.conversation.count({ where: conversationFilter });
  const pausedConversations = await prisma.conversation.count({ 
    where: { aiStatus: 'paused', ...conversationFilter } 
  });
  const activeConversations = await prisma.conversation.count({ 
    where: { aiStatus: 'active', ...conversationFilter } 
  });

  const aiDeflectionRate = totalMessages > 0 ? Math.round((aiMessages / (aiMessages + humanMessages || 1)) * 100) : 0;
  const humanHandoffRate = totalConversations > 0 ? Math.round((pausedConversations / totalConversations) * 100) : 0;

  return (
    <div className="p-8 bg-brand-light flex-1 h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Performance Reports</h1>
          <p className="text-sm text-slate-500">Custom analytics and downloadable channel data for {dbUser?.client?.name}.</p>
        </div>

        {/* Actions: Dynamic Filters & Export Download */}
        <div className="flex items-center gap-3">
          <form method="GET" className="flex items-center gap-2">
            <select 
              name="platform"
              defaultValue={selectedPlatform || ''}
              className="p-2.5 border border-brand-border rounded-md text-sm bg-brand-card text-slate-700 focus:outline-brand-orange"
            >
              <option value="">All Platforms</option>
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
            <button 
              type="submit" 
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
            >
              Filter
            </button>
          </form>
          <DownloadButton platform={selectedPlatform} />
        </div>
      </div>
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-brand-card p-6 rounded-xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Total Messages Processed</h3>
          <p className="text-4xl font-bold text-slate-800">{totalMessages}</p>
          <p className="text-xs text-slate-400 mt-2">{customerMessages} customer inquiries received</p>
        </div>

        <div className="bg-brand-card p-6 rounded-xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">AI Deflection Rate</h3>
          <p className="text-4xl font-bold text-brand-orange">{aiDeflectionRate}%</p>
          <p className="text-xs text-slate-400 mt-2">Percentage of replies handled entirely by AI</p>
        </div>

        <div className="bg-brand-card p-6 rounded-xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Human Handoff Rate</h3>
          <p className="text-4xl font-bold text-slate-800">{humanHandoffRate}%</p>
          <p className="text-xs text-slate-400 mt-2">Threads requiring human agent intervention</p>
        </div>
      </div>

      {/* Detailed Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-brand-card p-6 rounded-xl border border-brand-border shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Sender Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-brand-border pb-3">
              <span className="text-slate-600 font-medium">Customer Inquiries</span>
              <span className="font-bold text-slate-800 px-3 py-1 bg-slate-100 rounded-md">{customerMessages}</span>
            </div>
            <div className="flex justify-between items-center border-b border-brand-border pb-3">
              <span className="text-slate-600 font-medium">AI Generated Responses</span>
              <span className="font-bold text-brand-orange px-3 py-1 bg-orange-50 rounded-md">{aiMessages}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Human Agent Replies</span>
              <span className="font-bold text-slate-800 px-3 py-1 bg-slate-100 rounded-md">{humanMessages}</span>
            </div>
          </div>
        </div>

        <div className="bg-brand-card p-6 rounded-xl border border-brand-border shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Conversation Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-brand-border pb-3">
              <span className="text-slate-600 font-medium">Active AI Controlled Threads</span>
              <span className="font-bold text-green-700 px-3 py-1 bg-green-50 rounded-md">{activeConversations}</span>
            </div>
            <div className="flex justify-between items-center border-b border-brand-border pb-3">
              <span className="text-slate-600 font-medium">Paused (Human Control) Threads</span>
              <span className="font-bold text-yellow-700 px-3 py-1 bg-yellow-50 rounded-md">{pausedConversations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Total Support Conversations</span>
              <span className="font-bold text-slate-800 px-3 py-1 bg-slate-100 rounded-md">{totalConversations}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}