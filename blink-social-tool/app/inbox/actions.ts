'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function sendMessage(formData: FormData) {
  const conversationId = formData.get('conversationId') as string;
  const messageText = formData.get('message') as string;

  if (!conversationId || !messageText) return;

  try {
    // 1. Fetch conversation and social account token
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { socialAccount: true }
    });

    if (!conversation || !conversation.socialAccount?.accessToken) {
      console.error('Conversation or access token missing');
      return;
    }

    const { platform, accessToken } = conversation.socialAccount;
    const recipientId = conversation.customerName.replace('User_', '');

    // 2. Dispatch to Meta Graph API if Instagram/Facebook
    if (platform === 'instagram' || platform === 'facebook') {
      const res = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: messageText }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Meta Graph API Error:', data);
        throw new Error(data.error?.message || 'Failed to send via Meta API');
      }
    }

    // 3. Save agent response locally
    await prisma.message.create({
      data: {
        conversationId,
        content: messageText,
        senderType: 'agent',
      }
    });

    // 4. Pause AI agent status when agent replies manually
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { aiStatus: 'paused' }
    });

    revalidatePath('/inbox');
  } catch (error) {
    console.error('Failed to send message:', error);
  }
}