import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTourPackageDto } from './dto/create-tour-package.dto';
import { UpdateTourPackageDto } from './dto/update-tour-package.dto';
import { TourPackageQueryDto } from './dto/tour-package-query.dto';

@Injectable()
export class TourPackagesService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateTourPackageDto) {
    const exists = await this.prisma.tourPackage.findFirst({
      where: { name: dto.name },
    });

    if (exists) {
      throw new ConflictException('Tour package with this name already exists');
    }

    const tour = await this.prisma.tourPackage.create({
      data: {
        ...dto,
        active: true,
      },
      include: {
        district: {
          include: {
            province: {
              include: {
                department: true,
              },
            },
          },
        },
        categoryPackage: true,
        educationLevel: true,
        supplier: true,
        images: true,
      },
    });

    return this.mapTourPackageResponse(tour);
  }

  async findAll(query: TourPackageQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any =
      query.active !== undefined
        ? { active: query.active === 'true' }
        : { active: true };

    const [data, total] = await Promise.all([
      this.prisma.tourPackage.findMany({
        where,
        skip,
        take: limit,
        include: {
          district: {
            include: {
              province: {
                include: {
                  department: true,
                },
              },
            },
          },
          categoryPackage: true,
          educationLevel: true,
          supplier: true,
          images: true,
          promotions: {
            include: {
              supplier: true,
            },
          },
          offers: {
            include: {
              offer: true,
            },
          },
        },
      }),
      this.prisma.tourPackage.count({ where }),
    ]);

    return {
      data: data.map((item) => this.mapTourPackageResponse(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const tour = await this.prisma.tourPackage.findUnique({
      where: { id },
      include: {
        district: {
          include: {
            province: {
              include: {
                department: true,
              },
            },
          },
        },
        categoryPackage: true,
        educationLevel: true,
        supplier: true,
        images: true,
        promotions: {
          include: {
            supplier: true,
          },
        },
        offers: {
          include: {
            offer: true,
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour package not found');
    }

    return this.mapTourPackageResponse(tour);
  }

  private mapTourPackageResponse(tour: any) {
    return {
      id: tour.id,
      name: tour.name,
      pricePersona: Number(tour.pricePersona),
      active: tour.active,
      description: tour.description,
      activities: tour.activities,
      includes: tour.includes,
      district: {
        name: tour.district.name,
        province: {
          name: tour.district.province.name,
          department: {
            name: tour.district.province.department.name,
          },
        },
      },
      category: {
        id: tour.categoryPackage.id,
        name: tour.categoryPackage.name,
      },
      educationLevel: {
        id: tour.educationLevel.id,
        name: tour.educationLevel.name,
      },
      supplier: {
        id: tour.supplier.id,
        companyName: tour.supplier.companyName,
      },
      promotions: tour.promotions?.map((p: any) => ({
        id: p.id,
        price: Number(p.price),
        name: p.name,
        description: p.description,
        supplier: {
          id: p.supplier.id,
          companyName: p.supplier.companyName,
        },
      })) || [],
      offers: tour.offers?.map((o: any) => ({
        id: o.offer.id,
        price: Number(tour.pricePersona) * (1 - (o.offer.discountPercent / 100)),
        name: o.offer.name,
        description: o.offer.description,
        discountPercent: o.offer.discountPercent,
        startDate: o.offer.startDate,
        endDate: o.offer.endDate,
        isGlobal: o.offer.isGlobal,
      })) || [],
      images: tour.images.map((img: any) => ({
        id: img.id,
        url: img.url,
      })),
      createdAt: tour.createdAt,
    };
  }

  async update(id: number, dto: UpdateTourPackageDto) {
    const tour = await this.prisma.tourPackage.findUnique({ where: { id } });

    if (!tour) {
      throw new NotFoundException('Tour package not found');
    }

    return this.prisma.tourPackage.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        pricePersona: true,
      },
    }).then(res => ({
      ...res,
      pricePersona: Number(res.pricePersona)
    }));
  }

  async deactivate(id: number) {
    const tour = await this.prisma.tourPackage.findUnique({ where: { id } });

    if (!tour) {
      throw new NotFoundException('Tour package not found');
    }

    if (!tour.active) {
      throw new ConflictException('Tour package is already inactive');
    }

    await this.prisma.tourPackage.update({
      where: { id },
      data: { active: false },
    });
  }

  async activate(id: number) {
    const tour = await this.prisma.tourPackage.findUnique({ where: { id } });

    if (!tour) {
      throw new NotFoundException('Tour package not found');
    }

    if (tour.active) {
      throw new ConflictException('Tour package is already active');
    }

    await this.prisma.tourPackage.update({
      where: { id },
      data: { active: true },
    });
  }

  async remove(id: number) {
    const tour = await this.prisma.tourPackage.findUnique({
      where: { id },
      include: {
        reservationDetails: {
          include: {
            reservation: true
          }
        },
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour package not found');
    }

    const hasActiveReservations = tour.reservationDetails.some(
      (rd) => rd.reservation.statusId !== 3
    );

    if (hasActiveReservations) {
      throw new ConflictException(
        'Tour package cannot be deleted because it has active reservations',
      );
    }

    await this.prisma.tourPackage.delete({ where: { id } });
  }

  async search(keyword: string) {
    const tours = await this.prisma.tourPackage.findMany({
      where: {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
          {
            district: {
              OR: [
                { name: { contains: keyword, mode: 'insensitive' } },
                {
                  province: {
                    OR: [
                      { name: { contains: keyword, mode: 'insensitive' } },
                      {
                        department: {
                          name: { contains: keyword, mode: 'insensitive' },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
        active: true,
      },
      include: {
        district: {
          include: {
            province: {
              include: {
                department: true,
              },
            },
          },
        },
        categoryPackage: true,
        educationLevel: true,
        supplier: true,
        images: true,
        promotions: {
          include: {
            supplier: true,
          },
        },
        offers: {
          include: {
            offer: true,
          },
        },
      },
    });

    return tours.map((t) => this.mapTourPackageResponse(t));
  }
}
