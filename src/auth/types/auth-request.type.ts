import type { Request } from 'express';
import type { User, Supplier } from '@prisma/client';

export type AuthenticatedRequest = Request & {
  user:
    | (User & { role: { id: number; name: string } })
    | (Supplier & { role: { id: number; name: string } });
};
