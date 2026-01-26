import { PrismaClient } from '@prisma/client';
import { resetSequence } from './shared/reset-sequence';

const educationLevels = [
  { name: 'Inicial' },
  { name: 'Primaria' },
  { name: 'Secundaria' },
  { name: 'Universitario' },
];

export async function seedEducationLevels(prisma: PrismaClient) {
  console.log('🌱 Seeding education levels...');

  await prisma.educationLevel.deleteMany();

  await resetSequence(prisma, 'EducationLevel_id_seq');

  await prisma.educationLevel.createMany({
    data: educationLevels,
  });

  console.log('✅ Education levels seeded');
}
