import { PrismaClient } from '@prisma/client';
import { seedRoles } from './seeds/roles.seed';
import { seedUbigeo } from './seeds/ubigeo.seed';
import { seedEducationLevels } from './seeds/education-levels.seed';
import { seedSuppliers } from './seeds/suppliers.seed';
import { seedCategoryPackages } from './seeds/category-packages.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Running database seeds...');

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeds cannot be executed in production');
  }

  //Orden importa por FK
  await seedRoles(prisma);
  await seedUbigeo(prisma);
  await seedEducationLevels(prisma);
  await seedCategoryPackages(prisma);

  await seedSuppliers(prisma);

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
