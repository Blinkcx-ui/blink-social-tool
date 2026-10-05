'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatInput({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !file) || sending) return;

    setSending(true);
    try {
      let mediaUrl = null;
      let mediaType = null;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'File upload failed');
        mediaUrl = uploadData.url;
        mediaType = uploadData.type;
      }

      const res = await fetch('/api/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversationId, 
          messageText: message || (mediaType === 'image' ? 'Sent an image' : 'Sent an attachment'),
          mediaUrl,
          mediaType
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Failed to send: ${data.error || 'Unknown error'}`);
        return;
      }

      setMessage('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      router.refresh();
    } catch (err: any) {
      console.error('Send error:', err);
      alert(err.message || 'Network error while sending message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 bg-brand-card border-t border-brand-border">
      {file && (
        <div className="mb-2 flex items-center justify-between bg-gray-100 p-2 rounded-md text-xs text-gray-700">
          <span className="truncate">📎 Attachment: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)</span>
          <button type="button" onClick={() => setFile(null)} className="text-red-500 font-bold hover:text-red-700 ml-2">✕</button>
        </div>
      )}
      <form onSubmit={handleSend} className="flex gap-2 items-center">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          className="hidden" 
          id="attachment-input"
        />
        <label 
          htmlFor="attachment-input" 
          className="p-3 bg-gray-100 hover:bg-gray-200 border border-brand-border rounded-md cursor-pointer text-gray-600 transition-colors"
          title="Attach file or photo"
        >
          📎
        </label>
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          autoComplete="off"
          placeholder="Type a message or attach a file..." 
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