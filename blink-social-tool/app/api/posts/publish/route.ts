import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { clientId, platform, content, mediaUrl } = await req.json();

    if (!clientId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save post record in your Neon database
    const newPost = await prisma.post.create({
      data: {
        clientId,
        platform,
        content,
        mediaUrl: mediaUrl || null,
        status: 'published',
      },
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}