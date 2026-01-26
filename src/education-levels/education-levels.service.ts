import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEducationLevelDto } from './dto/create-education-level.dto';
import { UpdateEducationLevelDto } from './dto/update-education-level.dto';
import { EducationLevelQueryDto } from './dto/education-level-query.dto';

@Injectable()
export class EducationLevelsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEducationLevelDto) {
    const exists = await this.prisma.educationLevel.findUnique({
      where: { name: dto.name },
    });

    if (exists) {
      throw new ConflictException(
        'Education level with this name already exists',
      );
    }

    return this.prisma.educationLevel.create({
      data: dto,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async findAll(query: EducationLevelQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.educationLevel.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
        },
        orderBy: { id: 'asc' },
      }),
      this.prisma.educationLevel.count(),
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
    const level = await this.prisma.educationLevel.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!level) {
      throw new NotFoundException('Education level not found');
    }

    return level;
  }

  async update(id: number, dto: UpdateEducationLevelDto) {
    await this.findOne(id);

    const exists = await this.prisma.educationLevel.findUnique({
      where: { name: dto.name },
    });

    if (exists && exists.id !== id) {
      throw new ConflictException(
        'Education level with this name already exists',
      );
    }

    return this.prisma.educationLevel.update({
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

    const hasRelations = await this.prisma.tourPackage.findFirst({
      where: { educationLevelId: id },
    });

    if (hasRelations) {
      throw new ConflictException(
        'Education level cannot be deleted because it is associated with tour packages',
      );
    }

    await this.prisma.educationLevel.delete({
      where: { id },
    });
  }
}
