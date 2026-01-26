import { PrismaClient } from '@prisma/client';
import { resetSequence } from './shared/reset-sequence';
import * as bcrypt from 'bcrypt';

export async function seedSuppliers(prisma: PrismaClient) {
  console.log('🌱 Seeding suppliers...');

  const supplierRole = await prisma.role.findUnique({
    where: { name: 'Supplier' },
  });

  if (!supplierRole) {
    throw new Error('Supplier role not found. Seed roles first.');
  }

  await prisma.supplier.deleteMany();

  await resetSequence(prisma, 'Supplier_id_seq');

  const password = await bcrypt.hash('Supplier123!', 10);

  const suppliers = Array.from({ length: 10 }).map((_, index) => ({
    email: `supplier${index + 1}@mail.com`,
    ruc: `20123456${(100 + index).toString().slice(-3)}`,
    representativeName: `Representative ${index + 1}`,
    companyName: `Supplier Company ${index + 1}`,
    phone: `+51999999${(10 + index).toString().padStart(2, '0')}`,
    password,
    avatar: null,
    roleId: supplierRole.id,
    active: true,
    verified: true,
  }));

  await prisma.supplier.createMany({
    data: suppliers,
  });

  console.log('✅ Suppliers seeded (active & verified)');
}
