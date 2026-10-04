'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function createNewClientCopy(formData: FormData) {
  const clientName = formData.get('clientName') as string;
  const adminEmail = formData.get('adminEmail') as string;
  const adminPassword = formData.get('adminPassword') as string;
  const logoChar = (formData.get('logoChar') as string) || 'A';

  const features = formData.getAll('features') as string[];
  const platforms = formData.getAll('platforms') as string[];

  if (!clientName || !adminEmail || !adminPassword) {
    throw new Error('Missing required fields for client provisioning.');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  try {
    // 1. Create the Client Tenant
    const newClient = await prisma.client.create({
      data: {
        name: clientName,
        logoChar: logoChar.toUpperCase(),
        enabledFeatures: features.length > 0 ? features : ['dashboard', 'ticketing', 'post', 'activity', 'report'],
        allowedPlatforms: platforms.length > 0 ? platforms : ['whatsapp', 'instagram'],
      },
    });

    // 2. Create the Real Admin User for this Client
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'client',
        clientId: newClient.id,
      },
    });

    // NOTE: Removed mock social account creation loop entirely. 
    // Social accounts will now only be added via real connections or OAuth.

    revalidatePath('/settings');
  } catch (error) {
    console.error('Error provisioning client:', error);
    throw new Error('Failed to create client user.');
  }
}

export async function deleteClient(formData: FormData) {
  'use server';
  const clientId = formData.get('clientId') as string;
  if (!clientId) return;

  try {
    await prisma.client.delete({
      where: { id: clientId },
    });
    revalidatePath('/settings');
  } catch (err) {
    console.error('Delete client error:', err);
  }
}