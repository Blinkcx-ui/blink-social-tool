export const clientConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Blink Social',
  appLogoChar: process.env.NEXT_PUBLIC_APP_LOGO_CHAR || 'B',
  
  // Feature flags (enable/disable specific tabs or integrations per client)
  features: {
    enableReports: process.env.NEXT_PUBLIC_ENABLE_REPORTS !== 'false',
    enableAiAutoReplies: process.env.NEXT_PUBLIC_ENABLE_AI !== 'false',
    supportedPlatforms: (process.env.NEXT_PUBLIC_PLATFORMS || 'instagram,whatsapp').split(','),
  },
};