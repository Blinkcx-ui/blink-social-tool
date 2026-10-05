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
    
    // 1. HARD BLOCK: Ignore echoes, read receipts, and delivery statuses
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

    if (!platformId || !messageText) return NextResponse.json({ success: true });

    // 2. HARD BLOCK: Prevent loop if you are sending a message to yourself
    if (String(platformId) === String(senderPsid)) {
      return NextResponse.json({ success: true, info: 'Ignored self-message loop' });
    }

    let socialAccount = await prisma.socialAccount.findFirst({
      where: { platformId: String(platformId) },
    }) || await prisma.socialAccount.findFirst();

    if (!socialAccount) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    // 3. FETCH PROFILE DATA
    let finalCustomerName = senderPsid ? `User_${senderPsid}` : 'Customer';
    let avatarUrl = null;
    
    if (senderPsid && socialAccount.accessToken) {
      try {
        const profileRes = await fetch(`https://graph.facebook.com/v20.0/${senderPsid}?fields=name,username,profile_pic&access_token=${socialAccount.accessToken}`);
        const profileData = await profileRes.json();
        if (profileData.name || profileData.username) finalCustomerName = profileData.name || profileData.username;
        if (profileData.profile_pic) avatarUrl = profileData.profile_pic;
      } catch (error) {
        console.error("Profile fetch failed");
      }
    }

    let conversation = await prisma.conversation.findFirst({
      where: { socialAccountId: socialAccount.id, customerName: finalCustomerName },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          socialAccountId: socialAccount.id,
          customerName: finalCustomerName,
          customerHandle: String(senderPsid),
          aiStatus: 'active',
          // Optional: If your Prisma schema has an avatar field, add it here:
          // avatarUrl: avatarUrl
        },
      });
    }

    // 4. THE DUPLICATE KILLER (Idempotency Check)
    // Checks if the exact same message was saved in the last 5 seconds
    const duplicateCheck = await prisma.message.findFirst({
      where: {
        conversationId: conversation.id,
        content: messageText,
        senderType: 'customer',
        createdAt: { gte: new Date(Date.now() - 5000) } 
      }
    });

    if (duplicateCheck) {
      console.log("Blocked duplicate webhook ping from Meta");
      return NextResponse.json({ success: true, info: 'Duplicate prevented' });
    }

    // Save actual unique message
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