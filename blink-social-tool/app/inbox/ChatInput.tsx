'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatInput({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, messageText: message })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Meta API Error: ${data.error || 'Failed to send'}`);
        return;
      }

      setMessage('');
      router.refresh();
    } catch (err) {
      console.error('Network error sending message:', err);
      alert('Network error while sending message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 bg-brand-card border-t border-brand-border">
      <form onSubmit={handleSend} className="flex gap-2">
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          autoComplete="off"
          placeholder="Type a message (Sending will automatically pause AI)..." 
          className="flex-1 p-3 border border-brand-border rounded-md text-sm bg-brand-light focus:outline-brand-orange"
        />
        <button 
          type="submit" 
          disabled={sending}
          className="bg-brand-orange hover:bg-orange-600 text-white px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}