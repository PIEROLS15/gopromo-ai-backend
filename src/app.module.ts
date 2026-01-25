import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ContactModule } from './contact/contact.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { SuppliersModule } from './suppliers/suppliers.module';

@Module({
  imports: [ContactModule, AuthModule, LocationsModule, SuppliersModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
