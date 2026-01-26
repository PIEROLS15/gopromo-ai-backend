import { IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryPackageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number;
}
