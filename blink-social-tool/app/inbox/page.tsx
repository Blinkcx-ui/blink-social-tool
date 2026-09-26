import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const revalidate = 0;

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ chatId?: string }>;
}) {
  // 1. Await the searchParams to get the URL values in Next.js 15+
  const resolvedParams = await searchParams;
  
  const conversations = await prisma.conversation.findMany({
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      socialAccount: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  // 2. Use the resolved params to find the active chat
  const activeChatId = resolvedParams.chatId || (conversations.length > 0 ? conversations[0].id : null);
  const activeChat = conversations.find(c => c.id === activeChatId);

  return (
    <div className="flex h-full">
      {/* Conversation List (Left Column) */}
      <div className="w-1/3 bg-brand-card border-r border-brand-border flex flex-col h-full">
        <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-light">
          <h2 className="font-semibold text-gray-800">Messages</h2>
          <span className="text-xs bg-brand-orange text-white px-2 py-1 rounded-full">
            {conversations.length} Active
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((chat) => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            const isActive = chat.id === activeChatId;
            
            return (
              <Link 
                href={`/inbox?chatId=${chat.id}`} 
                key={chat.id} 
                className={`block p-4 border-b border-brand-border hover:bg-brand-light cursor-pointer border-l-4 transition-colors ${
                  isActive ? 'border-l-brand-orange bg-brand-light' : 'border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-800">
                    {chat.customerName} ({chat.socialAccount.platform})
                  </span>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {lastMessage ? lastMessage.content : 'No messages yet'}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active Chat Window (Right Column) */}
      <div className="flex-1 flex flex-col h-full bg-brand-light">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-brand-border bg-brand-card flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800">{activeChat.customerName}</h3>
                <p className="text-xs text-gray-500">
                  {activeChat.customerHandle} via {activeChat.socialAccount.platform}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">AI Agent:</span>
                <span className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                  activeChat.aiStatus === 'active' 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                }`}>
                  {activeChat.aiStatus === 'active' ? 'Active' : 'Paused (Human Control)'}
                </span>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {activeChat.messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.senderType === 'customer' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`p-3 rounded-lg max-w-md shadow-sm ${
                    msg.senderType === 'customer'
                      ? 'bg-brand-card border border-brand-border rounded-tl-none text-gray-800'
                      : 'bg-brand-orange text-white rounded-tr-none'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    {msg.senderType !== 'customer' && (
                      <p className="text-[10px] text-orange-200 mt-1 text-right">
                        Sent by {msg.senderType.toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input Area (Static for now) */}
            <div className="p-4 bg-brand-card border-t border-brand-border">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type a message (Sending will automatically pause AI)..." 
                  className="flex-1 p-3 border border-brand-border rounded-md text-sm bg-brand-light focus:outline-brand-orange"
                />
                <button className="bg-brand-orange hover:bg-brand-orange-hover text-white px-6 py-3 rounded-md font-medium transition-colors">
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No active conversations found.
          </div>
        )}
      </div>
    </div>
  );
}