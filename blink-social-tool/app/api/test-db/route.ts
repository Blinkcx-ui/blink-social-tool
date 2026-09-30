import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Attempt to fetch all users (excluding passwords for safety)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      }
    });
    
    return NextResponse.json({ 
      status: "Database Connected!", 
      userCount: users.length, 
      users 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      status: "Database Connection FAILED", 
      error: error.message 
    }, { status: 500 });
  }
}