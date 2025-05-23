import { PrismaClient } from '../src/generated/prisma';
import { hashPassword } from '../src/utils';

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: 'user1@example.com',
      password: await hashPassword('password1'),
    },
    {
      email: 'user2@example.com',
      password: await hashPassword('password2'),
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
