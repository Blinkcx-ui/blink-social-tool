import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === (process.env.WEBHOOK_VERIFY_TOKEN || 'blink_secure_token')) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    
    const messagingEvent = entry?.messaging?.[0];
    
    // 1. STRICT FILTER: Ignore echoes, reads, and delivery receipts (Stops doubling)
    if (messagingEvent?.message?.is_echo || messagingEvent?.read || messagingEvent?.delivery) {
      return NextResponse.json({ success: true, info: 'Ignored status event' });
    }

    let platformId = null;
    let senderPsid = null;
    let messageText = null;

    if (messagingEvent) {
      platformId = messagingEvent.recipient?.id || entry.id;
      senderPsid = messagingEvent.sender?.id;
      messageText = messagingEvent.message?.text || messagingEvent.postback?.title || 'Media / Attachment';
    } else if (entry?.changes?.[0]?.value) {
      const change = entry.changes[0].value;
      platformId = change.metadata?.phone_number_id || change.metadata?.page_id || entry?.id;
      senderPsid = change.messages?.[0]?.from;
      messageText = change.messages?.[0]?.text?.body || 'Media message';
    }

    if (!platformId || !messageText) {
      return NextResponse.json({ success: true });
    }

    let socialAccount = await prisma.socialAccount.findFirst({
      where: { platformId: String(platformId) },
    }) || await prisma.socialAccount.findFirst();

    if (!socialAccount) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    // Fetch real profile name
    let finalCustomerName = senderPsid ? `User_${senderPsid}` : 'Customer';
    if (senderPsid && socialAccount.accessToken) {
      try {
        const profileRes = await fetch(`https://graph.facebook.com/v20.0/${senderPsid}?fields=name,username&access_token=${socialAccount.accessToken}`);
        const profileData = await profileRes.json();
        if (profileData.name || profileData.username) {
          finalCustomerName = profileData.name || profileData.username;
        }
      } catch (error) {
        console.error("Profile fetch failed", error);
      }
    }

    // Find or create conversation - IMPORTANT: Saving raw senderPsid in customerHandle
    let conversation = await prisma.conversation.findFirst({
      where: { socialAccountId: socialAccount.id, customerName: finalCustomerName },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          socialAccountId: socialAccount.id,
          customerName: finalCustomerName,
          customerHandle: String(senderPsid), // Store the exact numerical ID here for replying!
          aiStatus: 'active',
        },
      });
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageText,
        senderType: 'customer',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}