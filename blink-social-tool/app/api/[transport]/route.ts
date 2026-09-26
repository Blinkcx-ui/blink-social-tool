import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const handler = createMcpHandler(
  (server) => {
    // Tool 1: List all active customer conversations
    server.tool(
      'get_conversations',
      'Fetch all active customer support conversations and their messages.',
      {},
      async () => {
        const conversations = await prisma.conversation.findMany({
          include: { messages: true, socialAccount: true },
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(conversations, null, 2) }],
        };
      }
    );

    // Tool 2: Send a message to a customer and pause AI
    server.tool(
      'send_reply',
      'Send a reply to a customer and automatically pause the AI agent.',
      {
        conversationId: z.string().describe('The ID of the conversation'),
        content: z.string().describe('The message content to send'),
      },
      async ({ conversationId, content }) => {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            aiStatus: 'paused',
            messages: { create: { content, senderType: 'human' } },
          },
        });

        return {
          content: [{ type: 'text', text: 'Message sent successfully and AI paused.' }],
        };
      }
    );
  },
  {},
  { basePath: '/api', maxDuration: 60 }
);

export { handler as GET, handler as POST };