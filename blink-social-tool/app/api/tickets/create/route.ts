import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { 
      conversationId, clientId, customerName, socialAccount, 
      mobile, email, city, source, ticketType, 
      category1, category2, category3, category4, details 
    } = await req.json();

    if (!clientId || !customerName) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Generate unique ticket number (e.g., TKT-123456)
    const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        clientId,
        conversationId,
        
        customerName,
        mobile,
        email,
        city,
        socialAccount,
        
        ticketType,
        category1,
        category2,
        category3,
        category4,
        
        source: source || 'web',
        details,
        status: 'Open'
      }
    });

    const client = await prisma.client.findUnique({ where: { id: clientId } });

    if (client?.escalation1Email) {
      console.log(`[ESCALATION LEVEL 1] Alerting: ${client.escalation1Email} for Ticket ${ticketNumber}`);
    }

    await prisma.notification.create({
      data: {
        clientId,
        type: 'TICKET_CREATED',
        content: `New ticket ${ticketNumber} created for ${customerName} (${ticketType})`,
        targetUrl: `/tickets?id=${ticket.id}`
      }
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}