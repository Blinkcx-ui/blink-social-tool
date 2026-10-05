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
    const entry = body.entry?.[0];
    
    // 1. STOP DUPLICATES: Ignore Meta's "echo" messages of your own replies
    const messagingEvent = entry?.messaging?.[0];
    if (messagingEvent?.message?.is_echo) {
      console.log("Ignored echo message to prevent duplicate chats.");
      return NextResponse.json({ success: true, info: 'Ignored echo' });
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
    } else {
      // Manual test payload
      platformId = body.platformId;
      senderPsid = body.senderName;
      messageText = body.messageText || body.content;
    }

    if (!platformId || !messageText) {
      return NextResponse.json({ success: true });
    }

    // 2. Find Social Account & Access Token
    let socialAccount = await prisma.socialAccount.findFirst({
      where: { platformId: String(platformId) },
    }) || await prisma.socialAccount.findFirst();

    if (!socialAccount) {
      return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
    }

    // 3. FETCH REAL PROFILE DATA FROM META
    let finalCustomerName = senderPsid ? `User_${senderPsid}` : 'Customer';
    let avatarUrl = null;

    if (senderPsid && socialAccount.accessToken) {
      try {
        const profileRes = await fetch(`https://graph.facebook.com/v20.0/${senderPsid}?fields=name,username,profile_pic&access_token=${socialAccount.accessToken}`);
        const profileData = await profileRes.json();
        
        if (profileData.name || profileData.username) {
          finalCustomerName = profileData.name || profileData.username;
        }
        if (profileData.profile_pic) {
          avatarUrl = profileData.profile_pic;
        }
      } catch (error) {
        console.error("Failed to fetch user profile from Meta:", error);
      }
    }

    // 4. Save Conversation
    let conversation = await prisma.conversation.findFirst({
      where: { socialAccountId: socialAccount.id, customerName: finalCustomerName },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          socialAccountId: socialAccount.id,
          customerName: finalCustomerName,
          customerHandle: `@${finalCustomerName.replace(/\s+/g, '').toLowerCase()}`,
          aiStatus: 'active',
          // If your Prisma schema has an avatar field, you can save avatarUrl here
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

    return NextResponse.json({ success: true, message: 'Processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}