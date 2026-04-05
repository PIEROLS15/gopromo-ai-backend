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
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTourPackageDto) {
    const exists = await this.prisma.tourPackage.findFirst({
      where: { name: dto.name },
    });

    if (exists) {
      throw new ConflictException('Tour package with this name already exists');
    }

    await this.ensureRelationsExist(dto);

    const tour = await this.prisma.tourPackage.create({
      data: {
        name: dto.name,
        districtId: dto.districtId,
        pricePersona: dto.pricePersona,
        categoryPackageId: dto.categoryPackageId,
        educationLevelId: dto.educationLevelId,
        description: dto.description,
        days: dto.days,
        minStudents: dto.minStudents,
        supplierId: dto.supplierId,
        active: true,
        travelInsurance: dto.services.travel_insurance,
        transport: dto.services.transport,
        feeding: dto.services.feeding,
        lodging: dto.services.lodging,
        availableMonday: dto.reservation_days.monday,
        availableTuesday: dto.reservation_days.tuesday,
        availableWednesday: dto.reservation_days.wednesday,
        availableThursday: dto.reservation_days.thursday,
        availableFriday: dto.reservation_days.friday,
        availableSaturday: dto.reservation_days.saturday,
        availableSunday: dto.reservation_days.sunday,
        itineraryDays: {
          create: dto.itinerary.days.map((itineraryDay) => ({
            day: itineraryDay.day,
            title: itineraryDay.title,
            steps: {
              create: itineraryDay.steps.map((step) => ({
                title: step.title,
                hour: this.timeToDate(step.hour),
                description: step.description,
                order: step.order,
              })),
            },
          })),
        },
      },
      include: this.buildInclude(),
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
        include: this.buildInclude(),
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
      include: this.buildInclude(),
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
      days: tour.days,
      minStudents: tour.minStudents,
      active: tour.active,
      description: tour.description,
      services: {
        travel_insurance: tour.travelInsurance,
        transport: tour.transport,
        feeding: tour.feeding,
        lodging: tour.lodging,
      },
      reservation_days: {
        monday: tour.availableMonday,
        tuesday: tour.availableTuesday,
        wednesday: tour.availableWednesday,
        thursday: tour.availableThursday,
        friday: tour.availableFriday,
        saturday: tour.availableSaturday,
        sunday: tour.availableSunday,
      },
      itinerary: {
        days:
          tour.itineraryDays?.map((day: any) => ({
            day: day.day,
            title: day.title,
            steps:
              day.steps?.map((step: any) => ({
                title: step.title,
                hour: this.dateToTime(step.hour),
                description: step.description,
                order: step.order,
              })) || [],
          })) || [],
      },
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
      promotions:
        tour.promotions?.map((p: any) => ({
          id: p.id,
          price: Number(p.price),
          name: p.name,
          description: p.description,
          supplier: {
            id: p.supplier.id,
            companyName: p.supplier.companyName,
          },
        })) || [],
      offers:
        tour.offers?.map((o: any) => ({
          id: o.offer.id,
          price:
            Number(tour.pricePersona) * (1 - o.offer.discountPercent / 100),
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

    if (dto.name && dto.name !== tour.name) {
      const exists = await this.prisma.tourPackage.findFirst({
        where: { name: dto.name },
      });

      if (exists) {
        throw new ConflictException(
          'Tour package with this name already exists',
        );
      }
    }

    if (
      dto.districtId ||
      dto.categoryPackageId ||
      dto.educationLevelId ||
      dto.supplierId
    ) {
      await this.ensureRelationsExist({
        districtId: dto.districtId ?? tour.districtId,
        categoryPackageId: dto.categoryPackageId ?? tour.categoryPackageId,
        educationLevelId: dto.educationLevelId ?? tour.educationLevelId,
        supplierId: dto.supplierId ?? tour.supplierId,
      });
    }

    const updated = await this.prisma.tourPackage.update({
      where: { id },
      data: {
        name: dto.name,
        districtId: dto.districtId,
        pricePersona: dto.pricePersona,
        categoryPackageId: dto.categoryPackageId,
        educationLevelId: dto.educationLevelId,
        description: dto.description,
        days: dto.days,
        minStudents: dto.minStudents,
        supplierId: dto.supplierId,
        travelInsurance: dto.services?.travel_insurance,
        transport: dto.services?.transport,
        feeding: dto.services?.feeding,
        lodging: dto.services?.lodging,
        availableMonday: dto.reservation_days?.monday,
        availableTuesday: dto.reservation_days?.tuesday,
        availableWednesday: dto.reservation_days?.wednesday,
        availableThursday: dto.reservation_days?.thursday,
        availableFriday: dto.reservation_days?.friday,
        availableSaturday: dto.reservation_days?.saturday,
        availableSunday: dto.reservation_days?.sunday,
      },
      select: {
        id: true,
        pricePersona: true,
      },
    });

    return {
      ...updated,
      pricePersona: Number(updated.pricePersona),
    };
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
            reservation: true,
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour package not found');
    }

    const hasActiveReservations = tour.reservationDetails.some(
      (rd) => rd.reservation.status !== 'Cancelled',
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
      include: this.buildInclude(),
    });

    return tours.map((t) => this.mapTourPackageResponse(t));
  }

  private buildInclude() {
    return {
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
      itineraryDays: {
        orderBy: { day: 'asc' as const },
        include: {
          steps: {
            orderBy: { order: 'asc' as const },
          },
        },
      },
    };
  }

  private async ensureRelationsExist(params: {
    districtId: number;
    categoryPackageId: number;
    educationLevelId: number;
    supplierId: number;
  }) {
    const [district, category, level, supplier] = await Promise.all([
      this.prisma.district.findUnique({
        where: { id: params.districtId },
        select: { id: true },
      }),
      this.prisma.categoryPackage.findUnique({
        where: { id: params.categoryPackageId },
        select: { id: true },
      }),
      this.prisma.educationLevel.findUnique({
        where: { id: params.educationLevelId },
        select: { id: true },
      }),
      this.prisma.supplier.findUnique({
        where: { id: params.supplierId },
        select: { id: true },
      }),
    ]);

    if (!district) {
      throw new NotFoundException('District not found');
    }

    if (!category) {
      throw new NotFoundException('Category package not found');
    }

    if (!level) {
      throw new NotFoundException('Education level not found');
    }

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
  }

  private timeToDate(hour: string): Date {
    const [h, m] = hour.split(':').map(Number);
    return new Date(Date.UTC(1970, 0, 1, h, m, 0));
  }

  private dateToTime(value: unknown): string {
    const raw =
      value instanceof Date ||
      typeof value === 'string' ||
      typeof value === 'number'
        ? value
        : new Date(0);
    const date = new Date(raw);
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
