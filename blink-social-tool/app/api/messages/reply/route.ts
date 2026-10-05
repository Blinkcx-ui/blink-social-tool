import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { conversationId, messageText, mediaUrl, mediaType } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { socialAccount: true }
    });

    if (!conversation || !conversation.socialAccount?.accessToken) {
      return NextResponse.json({ error: 'Active social account or token missing' }, { status: 400 });
    }

    const { platform, accessToken } = conversation.socialAccount;
    const recipientId = conversation.customerHandle.replace('@', '');

    if (platform === 'instagram' || platform === 'facebook') {
      const payload: any = {
        recipient: { id: recipientId },
        message: {}
      };

      if (mediaUrl && mediaType === 'image') {
        payload.message.attachment = {
          type: 'image',
          payload: { url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.blinktolink.com'}${mediaUrl}`, is_reusable: true }
        };
      } else {
        payload.message.text = messageText || 'Attachment';
      }

      const res = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: data.error?.message || 'Meta API rejection' }, { status: 400 });
      }
    }

    const savedMessage = await prisma.message.create({
      data: { 
        conversationId, 
        content: messageText || 'Sent attachment', 
        mediaUrl, 
        mediaType, 
        senderType: 'agent' 
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { aiStatus: 'paused' }
    });

    return NextResponse.json({ success: true, savedMessage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}