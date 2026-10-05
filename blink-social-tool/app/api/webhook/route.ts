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

    if (!platformId || !messageText || String(platformId) === String(senderPsid)) {
      return NextResponse.json({ success: true });
    }

    const socialAccount = await prisma.socialAccount.findFirst({
      where: { platformId: String(platformId) },
    }) || await prisma.socialAccount.findFirst();

    if (!socialAccount) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    // 1. Fetch Profile Data & Avatar from Meta
    let finalCustomerName = 'Customer';
    let finalAvatarUrl = null;
    
    if (senderPsid && socialAccount.accessToken) {
      try {
        const profileRes = await fetch(`https://graph.facebook.com/v20.0/${senderPsid}?fields=name,username,profile_pic&access_token=${socialAccount.accessToken}`);
        const profileData = await profileRes.json();
        if (profileData.name || profileData.username) finalCustomerName = profileData.name || profileData.username;
        if (profileData.profile_pic) finalAvatarUrl = profileData.profile_pic;
      } catch (e) {
        console.error("Profile fetch failed");
      }
    }

    // 2. ATOMIC UPSERT: Physically guarantees zero duplicates
    const conversation = await prisma.conversation.upsert({
      where: {
        socialAccountId_customerHandle: {
          socialAccountId: socialAccount.id,
          customerHandle: String(senderPsid),
        }
      },
      update: {
        // Updates the profile picture and name if they change later
        customerName: finalCustomerName !== 'Customer' ? finalCustomerName : undefined,
        avatarUrl: finalAvatarUrl || undefined, 
      },
      create: {
        socialAccountId: socialAccount.id,
        customerName: finalCustomerName,
        customerHandle: String(senderPsid),
        avatarUrl: finalAvatarUrl, // Saves the avatar to the DB
        aiStatus: 'active',
      }
    });

    // 3. Message Deduplication lock (15 seconds)
    const duplicateMessage = await prisma.message.findFirst({
      where: {
        conversationId: conversation.id,
        content: messageText,
        senderType: 'customer',
        createdAt: { gte: new Date(Date.now() - 15000) } 
      }
    });

    if (duplicateMessage) return NextResponse.json({ success: true, info: 'Duplicate blocked' });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: messageText,
        senderType: 'customer',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}