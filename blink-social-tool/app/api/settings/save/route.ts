import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await prisma.client.findFirst();

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    await prisma.client.update({
      where: { id: client.id },
      data: {
        escalation1Email: body.escalation1Email,
        escalation2Email: body.escalation2Email,
        escalation2Hours: Number(body.escalation2Hours) || 4,
        escalation3Email: body.escalation3Email,
        escalation3Hours: Number(body.escalation3Hours) || 24,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}