import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { conversationId, messageText } = await req.json();

    if (!conversationId || !messageText) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { socialAccount: true }
    });

    if (!conversation || !conversation.socialAccount?.accessToken) {
      return NextResponse.json({ error: 'Token or conversation missing' }, { status: 400 });
    }

    const { platform, accessToken } = conversation.socialAccount;
    const recipientId = conversation.customerName.replace('User_', '');

    console.log(`Attempting to send outbound message to recipient: ${recipientId} via ${platform}`);

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
      console.log("Meta Graph API Response:", JSON.stringify(data, null, 2));

      if (!res.ok) {
        throw new Error(data.error?.message || 'Meta API rejected message');
      }
    }

    const savedMessage = await prisma.message.create({
      data: {
        conversationId,
        content: messageText,
        senderType: 'agent',
      }
    });

    return NextResponse.json({ success: true, savedMessage });
  } catch (error: any) {
    console.error('Detailed Reply Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}