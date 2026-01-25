import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ContactModule } from './contact/contact.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { EducationLevelsModule } from './education-levels/education-levels.module';

@Module({
  imports: [
    ContactModule,
    AuthModule,
    LocationsModule,
    SuppliersModule,
    EducationLevelsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
