import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { platform, content, mediaUrl } = await req.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get('blink_session')?.value;

    let clientId = null;
    if (userId && userId !== 'demo-master-id' && userId !== 'super-admin-blink') {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
      clientId = dbUser?.clientId;
    }

    if (!clientId) {
      let masterClient = await prisma.client.findFirst({ where: { name: 'Master Workspace' } });
      if (!masterClient) {
        masterClient = await prisma.client.create({
          data: { name: 'Master Workspace', enabledFeatures: ['dashboard', 'ticketing', 'post', 'activity', 'report'] }
        });
      }
      clientId = masterClient.id;
    }

    // 1. Fetch connected social account credentials for live API publishing
    const socialAccount = await prisma.socialAccount.findFirst({
      where: { clientId, platform: platform.toLowerCase() }
    });

    // 2. If an access token exists, publish live to Meta/Instagram/Facebook Graph API
    if (socialAccount && socialAccount.accessToken && socialAccount.platformId) {
      const pageId = socialAccount.platformId;
      const accessToken = socialAccount.accessToken;

      if (platform.toLowerCase() === 'instagram') {
        // Step A: Create IG Container
        const containerRes = await fetch(`https://graph.facebook.com/v20.0/${pageId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: mediaUrl, // Note: For Meta API, mediaUrl must be a public URL, not base64
            caption: content,
            access_token: accessToken
          })
        });
        const containerData = await containerRes.json();
        
        if (containerData.id) {
          // Step B: Publish IG Container
          await fetch(`https://graph.facebook.com/v20.0/${pageId}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creation_id: containerData.id,
              access_token: accessToken
            })
          });
        }
      } else if (platform.toLowerCase() === 'facebook') {
        // Publish to Facebook Page Feed
        await fetch(`https://graph.facebook.com/v20.0/${pageId}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            link: mediaUrl,
            access_token: accessToken
          })
        });
      }
    }

    // 3. Save to local database for internal tracking
    const post = await prisma.post.create({
      data: {
        clientId,
        platform: platform || 'instagram',
        content: content || '',
        mediaUrl: mediaUrl || null,
        status: 'published'
      }
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Live publish error:', error);
    return NextResponse.json({ error: error.message || 'Failed to publish live' }, { status: 500 });
  }
}