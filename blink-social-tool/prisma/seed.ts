import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a dummy client with nested accounts, conversations, and messages
  const alphaCorp = await prisma.client.create({
    data: {
      name: 'Alpha Corp',
      accounts: {
        create: [
          {
            platform: 'instagram',
            platformId: 'ig_12345',
            conversations: {
              create: [
                {
                  customerName: 'John Doe',
                  customerHandle: '@johndoe',
                  aiStatus: 'active',
                  messages: {
                    create: [
                      { content: 'How much is the enterprise pricing?', senderType: 'customer' },
                      { content: 'Hi John! Our enterprise plans start at $99/mo. Would you like a demo?', senderType: 'ai' }
                    ]
                  }
                }
              ]
            }
          },
          {
            platform: 'whatsapp',
            platformId: 'wa_98765',
            conversations: {
              create: [
                {
                  customerName: 'Sarah Smith',
                  customerHandle: '+1234567890',
                  aiStatus: 'paused',
                  messages: {
                    create: [
                      { content: 'I need help with my recent order.', senderType: 'customer' },
                      { content: 'I can help with that! Let me check your account.', senderType: 'human' }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Database seeded successfully with Client ID:', alphaCorp.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });