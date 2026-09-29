import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Read the data sent from the CreateTicketModal
    const body = await req.json();
    const {
      conversationId,
      clientId,
      customerName,
      source,
      contactDetails,
      city,
      category,
      details,
    } = body;

    // 2. Basic validation to ensure required fields aren't empty
    if (!clientId || !customerName || !contactDetails || !details) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // 3. Save the new ticket to the database using Prisma
    const newTicket = await prisma.ticket.create({
      data: {
        clientId,
        conversationId,
        customerName,
        source,
        contactDetails,
        city: city || null, // City is optional in your schema
        category,
        details,
      },
    });

    // 4. Return success to close the modal
    return NextResponse.json(newTicket, { status: 201 });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' }, 
      { status: 500 }
    );
  }
}