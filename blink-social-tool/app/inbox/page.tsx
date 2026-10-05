import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import CreateTicketModal from '@/components/CreateTicketModal';
import ChatInput from './ChatInput';
import AutoRefresh from './AutoRefresh';

export const revalidate = 0;

const getInitials = (name: string) => {
  const clean = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  return clean ? clean.substring(0, 2).toUpperCase() : 'U';
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ chatId?: string }>;
}) {
  const resolvedParams = await searchParams;
  
  const conversations = await prisma.conversation.findMany({
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      socialAccount: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const activeChatId = resolvedParams.chatId || (conversations.length > 0 ? conversations[0].id : null);
  const activeChat = conversations.find(c => c.id === activeChatId);

  return (
    <div className="flex h-full relative">
      <AutoRefresh />
      
      {/* Left Sidebar */}
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
            const avatar = chat.avatarUrl;
            
            return (
              <Link 
                href={`/inbox?chatId=${chat.id}`} 
                key={chat.id} 
                className={`block p-4 border-b border-brand-border hover:bg-brand-light cursor-pointer border-l-4 transition-colors ${
                  isActive ? 'border-l-brand-orange bg-brand-light' : 'border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(chat.customerName)}
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-800 truncate">{chat.customerName}</span>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">Live</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {lastMessage ? (lastMessage.mediaUrl ? '📎 Attachment' : lastMessage.content) : 'No messages yet'}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Chat View */}
      <div className="flex-1 flex flex-col h-full bg-brand-light">
        {activeChat ? (
          <>
            <div className="p-4 border-b border-brand-border bg-brand-card flex justify-between items-center">
              <div className="flex items-center gap-3">
                {activeChat.avatarUrl ? (
                   <img src={activeChat.avatarUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                ) : (
                   <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center text-white font-bold text-lg">
                     {getInitials(activeChat.customerName)}
                   </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">{activeChat.customerName}</h3>
                  <p className="text-xs text-gray-500">via {activeChat.socialAccount.platform}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <CreateTicketModal 
                  conversationId={activeChat.id}
                  clientId={activeChat.socialAccount.clientId}
                  customerName={activeChat.customerName}
                  customerHandle={activeChat.customerHandle}
                  source={activeChat.socialAccount.platform}
                />
                <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                  <span className="text-sm text-gray-600 font-medium">AI Agent:</span>
                  <span className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                    activeChat.aiStatus === 'active' 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}>
                    {activeChat.aiStatus === 'active' ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {activeChat.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderType === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-3 rounded-lg max-w-md shadow-sm ${
                    msg.senderType === 'customer'
                      ? 'bg-brand-card border border-brand-border rounded-tl-none text-gray-800'
                      : 'bg-brand-orange text-white rounded-tr-none'
                  }`}>
                    {msg.mediaUrl && (
                      <div className="mb-2">
                        {msg.mediaType === 'image' ? (
                          <img src={msg.mediaUrl} alt="Attachment" className="max-w-xs rounded-md border border-white/20" />
                        ) : (
                          <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="underline font-semibold text-xs flex items-center gap-1">
                            📎 Download File
                          </a>
                        )}
                      </div>
                    )}
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

            <ChatInput conversationId={activeChat.id} />
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