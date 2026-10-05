import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}