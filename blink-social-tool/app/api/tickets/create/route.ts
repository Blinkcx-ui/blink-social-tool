import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend securely using your Vercel environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // ACTUAL EMAIL DISPATCH VIA RESEND
    if (client?.escalation1Email) {
      try {
        await resend.emails.send({
          from: 'Blink Social Support <support@blinktolink.com>',
          to: [client.escalation1Email],
          subject: `[New Ticket Alert] ${ticketNumber} - ${customerName}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #ea580c;">New Support Ticket Created</h2>
              <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
              <p><strong>Ticket Type:</strong> ${ticketType}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
              <h3>Customer Profile</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Mobile:</strong> ${mobile || 'N/A'}</p>
              <p><strong>Email:</strong> ${email || 'N/A'}</p>
              <p><strong>City:</strong> ${city || 'N/A'}</p>
              <p><strong>Source / Social:</strong> ${socialAccount || source}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
              <h3>Categories</h3>
              <p>${category1 || '-'} > ${category2 || '-'} > ${category3 || '-'} > ${category4 || '-'}</p>
              <h3>Issue Details</h3>
              <p style="background: #f8fafc; padding: 12px; border-radius: 6px;">${details}</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Failed to dispatch escalation email via Resend:', emailErr);
      }
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
    console.error('Ticket creation error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}