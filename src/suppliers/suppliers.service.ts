import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupplierQueryDto } from './dto/supplier-query.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierPartialDto } from './dto/update-supplier-partial.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: SupplierQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.active !== undefined) {
      where.active = query.active === 'true';
    } else {
      where.active = true;
    }

    if (query.verified !== undefined) {
      where.verified = query.verified === 'true';
    }

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          companyName: true,
          email: true,
          ruc: true,
          phone: true,
          avatar: true,
          active: true,
          verified: true,
          createdAt: true,
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        email: true,
        ruc: true,
        representativeName: true,
        phone: true,
        avatar: true,
        active: true,
        verified: true,
        createdAt: true,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async update(id: number, dto: UpdateSupplierDto) {
    await this.findOne(id);

    return this.prisma.supplier.update({
      where: { id },
      data: dto,
      select: { id: true, companyName: true },
    });
  }

  async updatePartial(id: number, dto: UpdateSupplierPartialDto) {
    await this.findOne(id);

    return this.prisma.supplier.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        phone: true,
        avatar: true,
      },
    });
  }

  async deactivate(id: number) {
    const supplier = await this.findOne(id);

    if (!supplier.active) {
      throw new ConflictException('Supplier is already inactive');
    }

    await this.prisma.supplier.update({
      where: { id },
      data: { active: false },
    });
  }

  async activate(id: number) {
    const supplier = await this.findOne(id);

    if (supplier.active) {
      throw new ConflictException('Supplier is already active');
    }

    await this.prisma.supplier.update({
      where: { id },
      data: { active: true },
    });
  }

  async approve(id: number) {
    const supplier = await this.findOne(id);

    if (supplier.verified) {
      throw new ConflictException('Supplier is already verified');
    }

    return this.prisma.supplier.update({
      where: { id },
      data: { verified: true },
      select: {
        id: true,
        email: true,
        ruc: true,
        representativeName: true,
        companyName: true,
        phone: true,
        avatar: true,
        roleId: true,
        active: true,
        verified: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const hasRelations = await this.prisma.tourPackage.findFirst({
      where: { supplierId: id },
    });

    if (hasRelations) {
      throw new ConflictException(
        'Supplier cannot be deleted because it has active tour packages or promotions',
      );
    }

    await this.prisma.supplier.delete({ where: { id } });
  }
}
