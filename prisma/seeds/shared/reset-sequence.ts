import { PrismaClient } from '@prisma/client';

export async function resetSequence(
  prisma: PrismaClient,
  sequenceName: string,
) {
  await prisma.$executeRawUnsafe(
    `ALTER SEQUENCE "${sequenceName}" RESTART WITH 1;`,
  );
}
