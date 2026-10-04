import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 1. Handle Webhook Verification (Required by Meta / Instagram / WhatsApp setup)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'blink_secure_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// 2. Handle Real-Time Incoming Messages and Events
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming Webhook Payload:", JSON.stringify(body, null, 2));

    let platformId = null;
    let senderName = 'Customer';
    let messageText = null;

    const entry = body.entry?.[0];

    // Check for Instagram / Messenger messaging array structure
    if (entry?.messaging?.[0]) {
      const messagingEvent = entry.messaging[0];
      platformId = messagingEvent.recipient?.id || entry.id;
      const senderPsid = messagingEvent.sender?.id;
      senderName = senderPsid ? `User_${senderPsid}` : 'Customer';
      messageText = messagingEvent.message?.text || messagingEvent.postback?.title || 'Media / Attachment';
    } 
    // Check for WhatsApp / Graph API changes structure
    else if (entry?.changes?.[0]?.value) {
      const change = entry.changes[0].value;
      platformId = change.metadata?.phone_number_id || change.metadata?.page_id || entry?.id;
      const messageObj = change.messages?.[0];
      if (messageObj) {
        senderName = messageObj.from || 'Customer';
        messageText = messageObj.text?.body || messageObj.type || 'Media message';
      }
    } 
    // Fallback for direct JSON test payloads
    else {
      platformId = body.platformId;
      senderName = body.senderName || 'Test Customer';
      messageText = body.messageText || body.content;
    }

    if (!platformId || !messageText) {
      return NextResponse.json({ success: true, info: 'Received event, but no message text found' });
    }

    // Find the linked social account in database
    let socialAccount = await prisma.socialAccount.findFirst({
      where: { platformId: String(platformId) },
    }) || await prisma.socialAccount.findFirst();

    if (!socialAccount) {
      return NextResponse.json({ error: 'Social account not found in database' }, { status: 404 });
    }

    // Find or create conversation thread
    let conversation = await prisma.conversation.findFirst({
      where: { 
        socialAccountId: socialAccount.id, 
        customerName: senderName 
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          socialAccountId: socialAccount.id,
          customerName: senderName,
          customerHandle: `@${senderName.toLowerCase()}`,
          aiStatus: 'active',
        },
      });
    }

    // Save incoming message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageText,
        senderType: 'customer',
      },
    });

    // Create notification alert
    await prisma.notification.create({
      data: {
        clientId: socialAccount.clientId,
        socialAccountId: socialAccount.id,
        type: 'MESSAGE',
        content: `New message from ${senderName}`,
        targetUrl: `/inbox`,
      },
    });

    return NextResponse.json({ success: true, message: 'Message logged successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}