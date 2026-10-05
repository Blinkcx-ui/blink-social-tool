import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { conversationId, messageText } = await req.json();

    if (!conversationId || !messageText) {
      return NextResponse.json({ error: 'Missing conversationId or messageText' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { socialAccount: true }
    });

    if (!conversation || !conversation.socialAccount?.accessToken) {
      return NextResponse.json({ error: 'Active session or token missing' }, { status: 400 });
    }

    const { platform, accessToken } = conversation.socialAccount;
    
    // Read the numerical ID we saved in the handle field
    const recipientId = conversation.customerHandle.replace('@', ''); 

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
        return NextResponse.json({ error: data.error?.message || 'Meta API Error' }, { status: 400 });
      }
    }

    const savedMessage = await prisma.message.create({
      data: { conversationId, content: messageText, senderType: 'agent' }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { aiStatus: 'paused' }
    });

    return NextResponse.json({ success: true, savedMessage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}