import { Module } from '@nestjs/common';
import { CategoryPackagesController } from './category-packages.controller';
import { CategoryPackagesService } from './category-packages.service';

@Module({
  controllers: [CategoryPackagesController],
  providers: [CategoryPackagesService],
})
export class CategoryPackagesModule {}
