import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL('/login', request.url));

  const { platform } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/callback/${platform}`;

  let authUrl = '';

  switch (platform.toLowerCase()) {
    case 'instagram':
    case 'whatsapp': {
      const appId = process.env.NEXT_PUBLIC_META_APP_ID;
      const scope = platform === 'whatsapp' 
        ? 'whatsapp_business_messaging,whatsapp_business_management' 
        : 'instagram_basic,instagram_manage_messages,pages_show_list';
      
      authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
      break;
    }
    case 'tiktok': {
      const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
      authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=user.info.basic,video.list&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
      break;
    }
    case 'x': {
      const clientId = process.env.X_CLIENT_ID;
      // X (Twitter) OAuth 2.0 endpoint
      authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20tweet.write%20users.read&state=state_security_123&code_challenge=challenge&code_challenge_method=plain`;
      break;
    }
    case 'snapchat': {
      const clientId = process.env.SNAP_CLIENT_ID;
      // Snapchat Marketing & Profile API endpoint
      authUrl = `https://accounts.snapchat.com/login/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=snapchat-profile-api`;
      break;
    }
    case 'google-reviews': {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      // Google Business Profile API endpoint
      authUrl = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=https://www.googleapis.com/auth/business.manage&access_type=offline`;
      break;
    }
    default:
      return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
  }

  return NextResponse.redirect(authUrl);
}