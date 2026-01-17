import { PrismaClient } from '@prisma/client';
import { seedRoles } from './seeds/roles.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Running database seeds...');

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeds cannot be executed in production');
  }

  //Orden importa por FK
  await seedRoles(prisma);

  console.log('🎉 All seeds executed successfully');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
