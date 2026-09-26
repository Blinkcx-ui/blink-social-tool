'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function createNewClientCopy(formData: FormData) {
  const clientName = formData.get('clientName') as string;
  const logoChar = formData.get('logoChar') as string;
  const logoUrl = formData.get('logoUrl') as string; // Capture Logo URL
  const adminEmail = formData.get('adminEmail') as string;
  const adminPassword = formData.get('adminPassword') as string;
  const enableReports = formData.get('enableReports') === 'on';
  const enableAiReplies = formData.get('enableAiReplies') === 'on';
  
  // Capture all checked platform boxes
  const selectedPlatforms = formData.getAll('platforms').join(',');

  if (!clientName || !adminEmail || !adminPassword) return;

  // 1. Hash the password before saving
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const newClient = await prisma.client.create({
    data: {
      name: clientName,
      logoChar: logoChar || clientName.charAt(0).toUpperCase(),
      logoUrl: logoUrl || null,
      enableReports,
      enableAiReplies,
      allowedPlatforms: selectedPlatforms || 'instagram,whatsapp',
      users: {
        // 2. Save the hashed password, not the plain text one
        create: { email: adminEmail, password: hashedPassword, role: 'client' },
      },
    },
  });

  revalidatePath('/settings');
  return { success: true, clientId: newClient.id };
}