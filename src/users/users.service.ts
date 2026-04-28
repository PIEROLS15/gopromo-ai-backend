import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { hashPassword } from '../auth/utils/password.util';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(
    id: number,
    dto: UpdateProfileDto,
    actorType: 'user' | 'supplier',
  ) {
    if (actorType === 'user') {
      await this.findOne(id);

      return this.prisma.user.update({
        where: { id },
        data: {
          fullName: dto.fullName,
          educationalInstitution: dto.educationalInstitution,
          phone: dto.phone,
          avatar: dto.avatar,
          password: dto.password ? await hashPassword(dto.password) : undefined,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          educationalInstitution: true,
          phone: true,
          avatar: true,
        },
      });
    }

    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!supplier) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.supplier.update({
      where: { id },
      data: {
        representativeName: dto.representativeName,
        companyName: dto.companyName,
        phone: dto.phone,
        avatar: dto.avatar,
        password: dto.password ? await hashPassword(dto.password) : undefined,
      },
      select: {
        id: true,
        email: true,
        representativeName: true,
        companyName: true,
        phone: true,
        avatar: true,
        active: true,
        verified: true,
      },
    });
  }

  async findAll(query: UserQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          educationalInstitution: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        educationalInstitution: true,
        avatar: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        roleId: dto.roleId,
        password: dto.password ? await hashPassword(dto.password) : undefined,
      },
      select: { id: true },
    });
  }

  async remove(targetUserId: number, actorUserId: number) {
    if (targetUserId === actorUserId) {
      throw new ForbiddenException('You are not allowed to delete this user');
    }

    await this.findOne(targetUserId);

    const hasReservations = await this.prisma.reservation.findFirst({
      where: { userId: targetUserId },
    });

    if (hasReservations) {
      throw new ConflictException(
        'User cannot be deleted because it has active reservations',
      );
    }

    await this.prisma.user.delete({ where: { id: targetUserId } });
  }
}
