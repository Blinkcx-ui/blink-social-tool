'use client';

import { useRef } from 'react';
import { sendMessage } from './actions';

export default function ChatInput({ conversationId }: { conversationId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="p-4 bg-brand-card border-t border-brand-border">
      <form 
        ref={formRef}
        action={async (formData) => {
          await sendMessage(formData);
          formRef.current?.reset(); // Clear the text input after sending
        }} 
        className="flex gap-2"
      >
        <input type="hidden" name="conversationId" value={conversationId} />
        <input 
          type="text" 
          name="message"
          required
          autoComplete="off"
          placeholder="Type a message (Sending will automatically pause AI)..." 
          className="flex-1 p-3 border border-brand-border rounded-md text-sm bg-brand-light focus:outline-brand-orange"
        />
        <button type="submit" className="bg-brand-orange hover:bg-brand-orange-hover text-white px-6 py-3 rounded-md font-medium transition-colors">
          Send
        </button>
      </form>
    </div>
  );
}