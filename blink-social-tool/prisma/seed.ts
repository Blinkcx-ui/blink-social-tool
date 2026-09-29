import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Wiping all existing database records...');

  // 1. Delete all records in reverse order of their relations
  await prisma.ticket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.post.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.user.deleteMany();
  await prisma.client.deleteMany();
  
  console.log('Database cleared. Creating master admin...');

  // 2. Securely hash the admin password
  const hashedPassword = await bcrypt.hash('Taha@2030', 10);

  // 3. Create the admin user
  // Note: Since your schema uses 'email' for login, we will store 'admin' in that field.
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@blinktolink.com',
      password: hashedPassword,
      role: 'admin',
      // clientId is left null because this is the master admin, not a client
    },
  });

  console.log('Seed completed successfully!');
  console.log(`Admin created with username: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });