import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, content, mediaUrl } = body;

    const cookieStore = await cookies();
    const userId = cookieStore.get('blink_session')?.value;

    let clientId = null;
    if (userId && userId !== 'demo-master-id' && userId !== 'super-admin-blink') {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
      clientId = dbUser?.clientId;
    }

    // Ensure we always have a valid master client workspace to satisfy foreign keys
    if (!clientId) {
      let masterClient = await prisma.client.findFirst({ where: { name: 'Master Workspace' } });
      if (!masterClient) {
        masterClient = await prisma.client.create({
          data: { 
            name: 'Master Workspace', 
            enabledFeatures: ['dashboard', 'ticketing', 'post', 'activity', 'report'] 
          }
        });
      }
      clientId = masterClient.id;
    }

    const post = await prisma.post.create({
      data: {
        clientId,
        platform: platform || 'instagram',
        content: content || 'No content',
        mediaUrl: mediaUrl || null,
        status: 'published'
      }
    });

    // Log event for the global notification bell / activity feed
    await prisma.notification.create({
      data: {
        clientId,
        type: 'POST_PUBLISHED',
        content: `New ${platform || 'social'} post published successfully.`,
        targetUrl: '/posts'
      }
    }).catch(() => {}); // Non-blocking alert log

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Post creation crash:', error);
    return NextResponse.json({ error: error.message || 'Internal server error while publishing' }, { status: 500 });
  }
}