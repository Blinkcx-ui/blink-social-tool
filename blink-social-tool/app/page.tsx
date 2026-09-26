import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function DashboardPage() {
  // 1. Fetch the active login session
  const session = await getServerSession(authOptions);

  // 2. If no one is logged in, kick them out to the login page
  if (!session) {
    redirect('/login');
  }

  // 3. Extract the custom client data from the session
  const { clientName, clientId } = session.user as any;

  // 4. Fetch Actual Account Data (Filtered to ONLY show this client's accounts)
  const activeAccounts = await prisma.socialAccount.findMany({
    where: { clientId: clientId }
  });

  // 5. Fetch Pending Conversations
  const pendingConversationsCount = await prisma.conversation.count({
    where: { aiStatus: 'paused' },
  });

  // 6. Fetch AI Handled Messages Today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const aiHandledTodayCount = await prisma.message.count({
    where: {
      senderType: 'ai',
      createdAt: {
        gte: startOfDay,
      },
    },
  });

  return (
    <div className="p-8 bg-brand-light flex-1 h-full">
      {/* Dynamic Welcome Message based on logged-in client */}
      <h1 className="text-3xl font-bold text-slate-800">
        Welcome to {clientName} Dashboard!
      </h1>
      <p className="text-slate-500 mt-2 mb-8">
        You are securely logged in as a client instance.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Messages Card */}
        <div className="bg-brand-card p-6 rounded-xl border border-brand-border shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Pending Messages</h3>
          <p className="text-4xl font-bold text-brand-orange">
            {pendingConversationsCount}
          </p>
        </div>

        {/* AI Handled Today Card */}
        <div className="bg-brand-card p-6 rounded-xl border border-brand-border shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-medium text-slate-500 mb-2">AI Handled Today</h3>
          <p className="text-4xl font-bold text-slate-800">
            {aiHandledTodayCount}
          </p>
        </div>

        {/* Connected Accounts Card (Updated for Visuals) */}
        <div className="bg-brand-card p-6 rounded-xl border border-brand-border shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Connected Accounts</h3>
          <div className="flex flex-wrap gap-3">
            {activeAccounts.length > 0 ? (
              activeAccounts.map((account) => (
                <PlatformLogo key={account.id} platform={account.platform} />
              ))
            ) : (
              <p className="text-sm text-gray-400">No accounts linked</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component to render nice visual logos based on platform string
function PlatformLogo({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  
  if (p === 'instagram') {
    return (
      <div 
        title="Instagram"
        className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm transition-transform hover:scale-105 cursor-default"
      >
        IG
      </div>
    );
  }
  
  if (p === 'whatsapp') {
    return (
      <div 
        title="WhatsApp"
        className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center text-white font-bold shadow-sm transition-transform hover:scale-105 cursor-default"
      >
        WA
      </div>
    );
  }

  // Default fallback for any other platforms (TikTok, X, etc.)
  return (
    <div 
      title={platform}
      className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white font-bold shadow-sm transition-transform hover:scale-105 cursor-default"
    >
      {platform.substring(0, 2).toUpperCase()}
    </div>
  );
}