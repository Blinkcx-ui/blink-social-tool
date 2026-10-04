import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { conversationId, messageText } = await req.json();

    if (!conversationId || !messageText) {
      return NextResponse.json({ error: 'Missing conversationId or messageText' }, { status: 400 });
    }

    // Find the conversation and its linked social account to get the access token
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { socialAccount: true }
    });

    if (!conversation || !conversation.socialAccount?.accessToken) {
      return NextResponse.json({ error: 'Conversation or access token not found' }, { status: 400 });
    }

    const { platform, accessToken } = conversation.socialAccount;
    // Extract the numerical recipient PSID from the customerName field (stored as User_ID)
    const recipientId = conversation.customerName.replace('User_', '');

    // Dispatch the reply through Meta's Graph API
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
        throw new Error(data.error?.message || 'Failed to send message via Meta Graph API');
      }
    }

    // Save the agent's reply message into your local database inbox
    const savedMessage = await prisma.message.create({
      data: {
        conversationId,
        content: messageText,
        senderType: 'agent',
      }
    });

    return NextResponse.json({ success: true, savedMessage });
  } catch (error: any) {
    console.error('Reply dispatch error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}