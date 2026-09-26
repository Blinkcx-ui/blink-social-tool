import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triggerAiReply } from '@/app/inbox/actions';

// GET: Handshake verification from Meta (WhatsApp / Instagram)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Match this token with what you set in your Meta Developer Console
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'blink_secure_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Verification failed', { status: 403 });
}

// POST: Ingest incoming customer messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic payload parsing for Meta/WhatsApp structure
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messageData = value?.messages?.[0];

    if (messageData) {
      const senderPhone = messageData.from; // e.g., customer handle/phone
      const messageBody = messageData.text?.body;
      const platformId = value.metadata?.phone_number_id || 'wa_default';

      if (senderPhone && messageBody) {
        // Find the social account in your database
        const socialAccount = await prisma.socialAccount.findFirst({
          where: { platformId },
        });

        if (socialAccount) {
          // Find or create a conversation for this customer
          let conversation = await prisma.conversation.findFirst({
            where: { socialAccountId: socialAccount.id, customerHandle: senderPhone },
          });

          if (!conversation) {
            conversation = await prisma.conversation.create({
              data: {
                socialAccountId: socialAccount.id,
                customerName: `Customer ${senderPhone.slice(-4)}`,
                customerHandle: senderPhone,
                aiStatus: 'active',
              },
            });
          }

          // Save the incoming customer message
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              content: messageBody,
              senderType: 'customer',
            },
          });

          // If AI is active, trigger an automated OpenAI response!
          if (conversation.aiStatus === 'active') {
            await triggerAiReply(conversation.id);
          }
        }
      }
    }

    // Always return 200 fast so Meta doesn't retry the webhook
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}