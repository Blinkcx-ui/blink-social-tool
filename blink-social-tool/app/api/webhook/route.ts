import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get('hub.mode') === 'subscribe' && url.searchParams.get('hub.verify_token') === (process.env.WEBHOOK_VERIFY_TOKEN || 'blink_secure_token')) {
    return new NextResponse(url.searchParams.get('hub.challenge'), { status: 200 });
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    const messagingEvent = entry?.messaging?.[0];
    
    // Ignore echoes, reads, and deliveries
    if (messagingEvent?.message?.is_echo || messagingEvent?.read || messagingEvent?.delivery) {
      return NextResponse.json({ success: true });
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

    if (!platformId || !messageText) return NextResponse.json({ success: true });
    if (String(platformId) === String(senderPsid)) return NextResponse.json({ success: true });

    let socialAccount = await prisma.socialAccount.findFirst({
      where: { platformId: String(platformId) },
    }) || await prisma.socialAccount.findFirst();

    if (!socialAccount) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    // CRITICAL FIX: Look up conversation by exact ID, not by name
    let conversation = await prisma.conversation.findFirst({
      where: { 
        socialAccountId: socialAccount.id, 
        customerHandle: String(senderPsid) // The unbreakable link
      },
    });

    let finalCustomerName = conversation?.customerName || 'Customer';
    
    // Fetch profile data async if we don't have a good name yet
    if (senderPsid && socialAccount.accessToken && finalCustomerName === 'Customer') {
      try {
        const profileRes = await fetch(`https://graph.facebook.com/v20.0/${senderPsid}?fields=name,username,profile_pic&access_token=${socialAccount.accessToken}`);
        const profileData = await profileRes.json();
        if (profileData.name || profileData.username) finalCustomerName = profileData.name || profileData.username;
      } catch (e) {
        console.error("Profile fetch failed");
      }
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          socialAccountId: socialAccount.id,
          customerName: finalCustomerName,
          customerHandle: String(senderPsid),
          aiStatus: 'active',
        },
      });
    } else if (conversation.customerName === 'Customer' && finalCustomerName !== 'Customer') {
      // Update name if we just fetched it successfully
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { customerName: finalCustomerName }
      });
    }

    // STRICT DEDUPLICATION: Ensure this exact text wasn't added in the last 10 seconds
    const duplicateCheck = await prisma.message.findFirst({
      where: {
        conversationId: conversation.id,
        content: messageText,
        senderType: 'customer',
        createdAt: { gte: new Date(Date.now() - 10000) } 
      }
    });

    if (duplicateCheck) return NextResponse.json({ success: true, info: 'Duplicate blocked' });

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