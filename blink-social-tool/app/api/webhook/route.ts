import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 1. Handle Webhook Verification (Required by Meta / WhatsApp / Instagram API setup)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  // Set your own verification token string here or via environment variables
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'blink_secure_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// 2. Handle Incoming Real-Time Messages and Notifications
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Standard payload handling for social channels (Meta/WhatsApp/Custom API)
    // You can adapt this depending on the exact JSON payload format of your provider
    const platformId = body.platformId || body.entry?.[0]?.id;
    const senderName = body.senderName || body.entry?.[0]?.messaging?.[0]?.sender?.id || 'Customer';
    const messageText = body.messageText || body.entry?.[0]?.messaging?.[0]?.message?.text;

    if (!platformId || !messageText) {
      return NextResponse.json({ success: true, warning: 'Ignored non-message event' });
    }

    // Find the linked social account in your database
    const socialAccount = await prisma.socialAccount.findFirst({
      where: { platformId },
    });

    if (!socialAccount) {
      return NextResponse.json({ error: 'Social account not found in database' }, { status: 404 });
    }

    // Find or create the conversation thread for this customer
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
          customerHandle: `@${senderName.toLowerCase().replace(/\s+/g, '_')}`,
          aiStatus: 'active',
        },
      });
    }

    // Save the real incoming message into your database inbox
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageText,
        senderType: 'customer',
      },
    });

    // Automatically spawn a notification alert for this new message
    await prisma.notification.create({
      data: {
        clientId: socialAccount.clientId,
        socialAccountId: socialAccount.id,
        type: 'MESSAGE',
        content: `New message received from ${senderName}`,
        targetUrl: `/inbox`,
      },
    });

    return NextResponse.json({ success: true, message: 'Message logged and synced successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}