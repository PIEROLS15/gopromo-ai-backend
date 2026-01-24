import { PrismaClient } from '@prisma/client';
import { resetSequence } from './shared/reset-sequence';

const roles = [{ name: 'Admin' }, { name: 'Supplier' }, { name: 'User' }];

export async function seedRoles(prisma: PrismaClient) {
  console.log('🌱 Seeding roles...');

  await prisma.role.deleteMany();

  await resetSequence(prisma, 'Role_id_seq');

  await prisma.role.createMany({
    data: roles,
  });

  console.log('✅ Roles seeded');
}
