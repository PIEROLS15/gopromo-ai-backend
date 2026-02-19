import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ContactModule } from './contact/contact.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { EducationLevelsModule } from './education-levels/education-levels.module';
import { CategoryPackagesModule } from './category-packages/category-packages.module';
import { TourPackagesModule } from './tour-packages/tour-packages.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    ContactModule,
    AuthModule,
    LocationsModule,
    SuppliersModule,
    EducationLevelsModule,
    CategoryPackagesModule,
    TourPackagesModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
