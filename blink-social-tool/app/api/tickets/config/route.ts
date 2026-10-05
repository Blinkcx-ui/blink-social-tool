import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('blink_session')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { client: true } });
    
    let clientConfig;
    if (user?.clientId) {
      clientConfig = await prisma.client.findUnique({ where: { id: user.clientId } });
    } else {
      clientConfig = await prisma.client.findFirst({ where: { name: 'Master Workspace' } });
    }

    return NextResponse.json({ ticketFields: clientConfig?.ticketFields || {} });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}