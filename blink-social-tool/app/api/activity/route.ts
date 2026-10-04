import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const dynamic = 'force-dynamic';

// GET: Fetch recent notifications for the activity page
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    const notifications = await prisma.notification.findMany({
      where: clientId ? { clientId } : undefined,
      include: { socialAccount: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, notifications }, { status: 200 });
  } catch (error) {
    console.error('Fetch notifications API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST: Ingest incoming webhooks (new followers, comments, reviews, tags)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, socialAccountId, type, content, targetUrl } = body;

    if (!clientId || !type || !content) {
      return NextResponse.json({ success: false, error: 'Missing required fields: clientId, type, content' }, { status: 400 });
    }

    const newNotification = await prisma.notification.create({
      data: {
        clientId,
        socialAccountId: socialAccountId || null,
        type, // e.g., "COMMENT", "REVIEW", "FOLLOW", "TAG"
        content,
        targetUrl: targetUrl || null,
        isRead: false,
      },
    });

    return NextResponse.json({ success: true, notification: newNotification }, { status: 201 });
  } catch (error) {
    console.error('Create notification API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 });
  }
}