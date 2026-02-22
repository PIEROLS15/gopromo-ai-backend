import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleQueryDto } from './dto/role-query.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const exists = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });

    if (exists) {
      throw new ConflictException('Role with this name already exists');
    }

    return this.prisma.role.create({
      data: dto,
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findAll(query: RoleQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.role.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
        },
        orderBy: { id: 'asc' },
      }),
      this.prisma.role.count(),
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
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    await this.findOne(id);

    const exists = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });

    if (exists && exists.id !== id) {
      throw new ConflictException('Role with this name already exists');
    }

    return this.prisma.role.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const [hasUsers, hasSuppliers] = await Promise.all([
      this.prisma.user.findFirst({ where: { roleId: id } }),
      this.prisma.supplier.findFirst({ where: { roleId: id } }),
    ]);

    if (hasUsers || hasSuppliers) {
      throw new ConflictException(
        'Role cannot be deleted because it is associated with users or suppliers',
      );
    }

    await this.prisma.role.delete({
      where: { id },
    });
  }
}
