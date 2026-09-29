import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        socialAccount: {
          select: { platform: true } // Pull in the platform name (instagram, tiktok, etc.)
        }
      }
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}