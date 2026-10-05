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
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      clientId = dbUser?.clientId;
    }

    // Fallback/Auto-create Master Workspace to prevent foreign key errors
    if (!clientId) {
      let masterClient = await prisma.client.findFirst({ where: { name: 'Master Workspace' } });
      if (!masterClient) {
        masterClient = await prisma.client.create({
          data: { name: 'Master Workspace', enabledFeatures: ['dashboard', 'ticketing', 'post', 'activity', 'report'] }
        });
      }
      clientId = masterClient.id;
    }

    const post = await prisma.post.create({
      data: {
        clientId,
        platform: platform || 'instagram',
        content,
        mediaUrl: mediaUrl || null,
        status: 'published'
      }
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}