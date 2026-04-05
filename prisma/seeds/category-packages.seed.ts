import { PrismaClient } from '@prisma/client';
import { resetSequence } from './shared/reset-sequence';

const categoryPackages = [
  { name: 'Aventura' },
  { name: 'Cultural' },
  { name: 'Naturaleza' },
  { name: 'Educativo' },
  { name: 'Historia' },
  { name: 'Gastronómico' },
  { name: 'Ecoturismo' },
  { name: 'Religioso' },
];

export async function seedCategoryPackages(prisma: PrismaClient) {
  console.log('🌱 Seeding category packages...');

  await prisma.categoryPackage.deleteMany();

  await resetSequence(prisma, 'CategoryPackage_id_seq');

  await prisma.categoryPackage.createMany({
    data: categoryPackages,
  });

  console.log('✅ Category packages seeded');
}
