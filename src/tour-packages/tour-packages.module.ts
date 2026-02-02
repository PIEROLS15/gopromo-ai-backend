import { Module } from '@nestjs/common';
import { TourPackagesController } from './tour-packages.controller';
import { TourPackagesService } from './tour-packages.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TourPackagesController],
  providers: [TourPackagesService],
})
export class TourPackagesModule {}
