import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // PASS-THROUGH: Allow everything instantly during the demo
  return NextResponse.next();
}

export const config = {
  matcher: [],
};