import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/settings?error=no_code', req.url));
  }

  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  try {
    // 1. Exchange the authorization code for a short-lived user access token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${clientSecret}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      throw new Error('Failed to obtain access token from Meta');
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch the user's connected pages/accounts from Meta Graph API
    const accountsRes = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?access_token=${accessToken}`
    );
    const accountsData = await accountsRes.json();

    // Grab the first dummy client record in your database for linking
    const client = await prisma.client.findFirst();
    if (!client) throw new Error('No default client found in database');

    // 3. Save each connected account into your Prisma SocialAccount table
    if (accountsData.data && accountsData.data.length > 0) {
      for (const account of accountsData.data) {
        await prisma.socialAccount.upsert({
          where: { platformId: account.id },
          update: { accessToken },
          create: {
            platform: 'instagram', // or dynamic based on account type
            platformId: account.id,
            clientId: client.id,
            accessToken,
          },
        });
      }
    }

    // 4. Redirect user back to the dashboard on success
    return NextResponse.redirect(new URL('/', req.url));
  } catch (error) {
    console.error('OAuth Error:', error);
    return NextResponse.redirect(new URL('/settings?error=oauth_failed', req.url));
  }
}