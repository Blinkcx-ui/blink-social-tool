'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function sendMessage(formData: FormData) {
  const content = formData.get('message') as string;
  const conversationId = formData.get('conversationId') as string;

  if (!content || !conversationId) return;

  // Update the conversation: pause AI and add the human message in one transaction
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      aiStatus: 'paused',
      messages: {
        create: {
          content,
          senderType: 'human',
        },
      },
    },
  });

  // Refresh the inbox page so the new message appears instantly
  revalidatePath('/inbox');
}