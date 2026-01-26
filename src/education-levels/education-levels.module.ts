import { Module } from '@nestjs/common';
import { EducationLevelsController } from './education-levels.controller';
import { EducationLevelsService } from './education-levels.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EducationLevelsController],
  providers: [EducationLevelsService],
})
export class EducationLevelsModule {}
