import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { conversationId, clientId, customerName, contactDetails, city, source, category, details } = await req.json();

    if (!clientId || !customerName) {
      return NextResponse.json({ error: 'Missing required ticket parameters' }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        clientId,
        conversationId,
        customerName,
        contactDetails: contactDetails || 'Not provided',
        city,
        source: source || 'web',
        category: category || 'Inquiry',
        details,
        status: 'Open'
      }
    });

    const client = await prisma.client.findUnique({ where: { id: clientId } });

    // Send Escalation Level 1 Email Notification
    if (client?.escalation1Email) {
      console.log(`[AUTOMATIC ESCALATION LEVEL 1 EMAIL] Sending ticket alert #${ticket.id} to: ${client.escalation1Email}`);
      // SendGrid/Resend API trigger goes here
    }

    // Log Activity Alert
    await prisma.notification.create({
      data: {
        clientId,
        type: 'TICKET_CREATED',
        content: `New ticket #${ticket.id.slice(0, 6)} created for ${customerName} (${category})`,
        targetUrl: `/tickets?id=${ticket.id}`
      }
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}