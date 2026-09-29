import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch reviews for a client
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');

  const reviews = await prisma.review.findMany({
    where: { clientId },
    orderBy: { createTime: 'desc' },
  });

  return NextResponse.json({ reviews });
}

// POST: Reply to a specific review
export async function POST(req: Request) {
  try {
    const { reviewId, replyComment, accountId, locationId, accessToken } = await req.json();

    // Send reply to Google Business Profile API
    const googleRes = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: replyComment }),
      }
    );

    if (!googleRes.ok) {
      throw new Error('Failed to post reply to Google Business Profile');
    }

    // Update local database record
    const updatedReview = await prisma.review.update({
      where: { reviewId },
      data: { replyComment },
    });

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}