import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('✅ Users already exist, skipping seed');
    return;
  }

  const users = [
    {
      email: 'user1@test.com',
      name: 'Usuario Test 1',
      balance: new Decimal(10000.5),
    },
    {
      email: 'user2@test.com',
      name: 'Usuario Test 2',
      balance: new Decimal(5000.0),
    },
    {
      email: 'user3@test.com',
      name: 'Usuario Test 3',
      balance: new Decimal(2500.75),
    },
    {
      email: 'user4@test.com',
      name: 'Usuario Test 4',
      balance: new Decimal(100.25),
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData,
    });
    console.log(`✅ Created user: ${user.id} with balance: ${user.balance}`);
  }

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Test users created:');
  console.log('  - user1@test.com (Balance: $10,000.50)');
  console.log('  - user2@test.com (Balance: $5,000.00)');
  console.log('  - user3@test.com (Balance: $2,500.75)');
  console.log('  - user4@test.com (Balance: $100.25)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
