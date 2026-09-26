import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const platform = searchParams.get('platform');

    const conversations = await prisma.conversation.findMany({
      include: {
        messages: true,
        socialAccount: true,
      },
    });

    const filteredConversations = platform && platform !== ''
      ? conversations.filter(c => c?.socialAccount?.platform?.toLowerCase() === platform.toLowerCase())
      : conversations;

    let csvRows = ['Conversation ID,Customer Name,Platform,AI Status,Total Messages'];

    for (const convo of filteredConversations) {
      const id = convo?.id || 'unknown';
      const customerName = (convo?.customerName || 'Customer').replace(/"/g, '""');
      const platformName = convo?.socialAccount?.platform || 'unknown';
      const aiStatus = convo?.aiStatus || 'active';
      const totalMessages = convo?.messages?.length || 0;
      
      csvRows.push(
        `"${id}","${customerName}","${platformName}","${aiStatus}",${totalMessages}`
      );
    }

    const csvString = csvRows.join('\n');

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="blink-social-report.csv"',
      },
    });
  } catch (error) {
    console.error('CRITICAL EXPORT ERROR:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}