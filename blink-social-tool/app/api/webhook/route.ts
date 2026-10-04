import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming Meta Webhook:", JSON.stringify(body, null, 2));

    let platformId = null;
    let senderName = 'Instagram User';
    let messageText = null;

    const entry = body.entry?.[0];

    // 1. Check for Instagram Messaging structure (entry[0].messaging)
    if (entry?.messaging?.[0]) {
      const messagingEvent = entry.messaging[0];
      platformId = messagingEvent.recipient?.id || entry.id;
      senderName = messagingEvent.sender?.id ? `User_${messagingEvent.sender.id.slice(-4)}` : 'Instagram User';
      messageText = messagingEvent.message?.text || messagingEvent.postback?.title || 'Media / Attachment';
    } 
    // 2. Check for WhatsApp / Graph API structure (entry[0].changes)
    else if (entry?.changes?.[0]?.value) {
      const change = entry.changes[0].value;
      platformId = change.metadata?.phone_number_id || change.metadata?.page_id || entry?.id;
      const messageObj = change.messages?.[0];
      if (messageObj) {
        senderName = messageObj.from || 'Customer';
        messageText = messageObj.text?.body || messageObj.type || 'Media message';
      }
    } 
    // 3. Fallback for manual test payloads
    else {
      platformId = body.platformId;
      senderName = body.senderName || 'Test Customer';
      messageText = body.messageText || body.content;
    }

    if (!platformId || !messageText) {
      return NextResponse.json({ success: true, info: 'Received event, no message text found' });
    }

    // Find the linked social account in database
    let socialAccount = await prisma.socialAccount.findFirst({
      where: { platformId: String(platformId) },
    });

    if (!socialAccount) {
      socialAccount = await prisma.socialAccount.findFirst();
    }

    if (!socialAccount) {
      return NextResponse.json({ error: 'Social account not found in DB' }, { status: 404 });
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

    return NextResponse.json({ success: true, message: 'Message saved successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}