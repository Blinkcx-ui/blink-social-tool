'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createNewClientCopy(formData: FormData) {
  const clientName = formData.get('clientName') as string;
  const adminEmail = formData.get('adminEmail') as string;
  const adminPassword = formData.get('adminPassword') as string;
  const logoUrl = formData.get('logoUrl') as string;
  const logoChar = formData.get('logoChar') as string || 'A';

  if (!clientName || !adminEmail) return;

  try {
    await prisma.client.create({
      data: {
        name: clientName,
        logoUrl: logoUrl || null,
        logoChar: logoChar,
        enableReports: true,
        enableAiReplies: true,
        users: {
          create: {
            email: adminEmail,
            password: adminPassword,
            role: 'client',
          }
        }
      }
    });
  } catch (e) {
    console.error("Failed to create client:", e);
  }

  revalidatePath('/settings');
}