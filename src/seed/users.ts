import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import chalk from 'chalk';

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
      name: 'Ricardo Lopez',
      balance: new Decimal(10000.5),
    },
    {
      email: 'user2@test.com',
      name: 'Agustín Ezequiel',
      balance: new Decimal(800000.0),
    },
    {
      email: 'user3@test.com',
      name: 'Mariano Gomez',
      balance: new Decimal(150000.75),
    },
    {
      email: 'user4@test.com',
      name: 'Juan Perez',
      balance: new Decimal(100.25),
    },
  ];
  console.log('🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰');
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData,
    });
    console.log(
      chalk.cyan(`ID: ${user.id}`) +
        chalk.white(' | Balance: ') +
        chalk.green(`$${user.balance.toLocaleString()}`) +
        chalk.white(' | Usuario creado ✅'),
    );
  }

  console.log('🎉 Seed completed successfully!');
  console.log('🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
