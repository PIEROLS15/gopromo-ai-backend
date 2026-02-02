import { IsBooleanString, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class TourPackageQueryDto {
  @IsOptional()
  @IsBooleanString()
  active?: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number;
}
