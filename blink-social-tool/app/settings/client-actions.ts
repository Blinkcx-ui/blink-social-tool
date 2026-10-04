'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt';

export async function createNewClientCopy(formData: FormData) {
  const clientName = formData.get('clientName') as string;
  const adminEmail = formData.get('adminEmail') as string;
  const adminPassword = formData.get('adminPassword') as string;
  const logoChar = (formData.get('logoChar') as string) || 'A';
  const logoUrl = formData.get('logoUrl') as string;

  // Selected tool features (dashboard, ticketing, post, activity, report)
  const features = formData.getAll('features') as string[];
  
  // Selected social platforms (whatsapp, instagram, tiktok, snapchat, facebook, x)
  const platforms = formData.getAll('platforms') as string[];

  if (!clientName || !adminEmail || !adminPassword) {
    throw new Error('Missing required fields for client provisioning.');
  }

  // Securely hash the admin password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  try {
    // 1. Create the new Client Organization Tenant with features and platforms
    const newClient = await prisma.client.create({
      data: {
        name: clientName,
        logoChar: logoChar.toUpperCase(),
        logoUrl: logoUrl || null,
        enabledFeatures: features.length > 0 ? features : ['dashboard', 'ticketing', 'post', 'activity', 'report'],
        allowedPlatforms: platforms.length > 0 ? platforms : ['whatsapp', 'instagram'],
      },
    });

    // 2. Create the Admin User tied directly to this client organization
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'client',
        clientId: newClient.id,
      },
    });

    // 3. Bulk-connect/initialize all selected social channels for this client
    if (platforms && platforms.length > 0) {
      for (const platform of platforms) {
        await prisma.socialAccount.create({
          data: {
            clientId: newClient.id,
            platform: platform.toLowerCase(),
            platformId: `${platform}_account_${Math.random().toString(36).substring(7)}`,
            accessToken: 'mock_token_' + Date.now(),
          },
        });
      }
    }

    revalidatePath('/settings');
    revalidatePath('/');
  } catch (error) {
    console.error('Error provisioning client copy and social channels:', error);
    throw new Error('Failed to create new client tenant copy.');
  }
}