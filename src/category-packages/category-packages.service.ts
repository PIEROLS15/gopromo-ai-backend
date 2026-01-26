import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryPackageDto } from './dto/create-category-package.dto';
import { UpdateCategoryPackageDto } from './dto/update-category-package.dto';
import { CategoryPackageQueryDto } from './dto/category-package-query.dto';

@Injectable()
export class CategoryPackagesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryPackageDto) {
    const exists = await this.prisma.categoryPackage.findUnique({
      where: { name: dto.name },
    });

    if (exists) {
      throw new ConflictException(
        'Category package with this name already exists',
      );
    }

    return this.prisma.categoryPackage.create({
      data: dto,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async findAll(query: CategoryPackageQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.categoryPackage.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
        },
      }),
      this.prisma.categoryPackage.count(),
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
    const category = await this.prisma.categoryPackage.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category package not found');
    }

    return category;
  }

  async update(id: number, dto: UpdateCategoryPackageDto) {
    await this.findOne(id);

    const exists = await this.prisma.categoryPackage.findUnique({
      where: { name: dto.name },
    });

    if (exists && exists.id !== id) {
      throw new ConflictException(
        'Category package with this name already exists',
      );
    }

    return this.prisma.categoryPackage.update({
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

    const hasPackages = await this.prisma.tourPackage.findFirst({
      where: { categoryPackageId: id },
    });

    if (hasPackages) {
      throw new ConflictException(
        'Category package cannot be deleted because it is associated with tour packages',
      );
    }

    await this.prisma.categoryPackage.delete({
      where: { id },
    });
  }
}
