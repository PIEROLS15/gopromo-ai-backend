import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class UserQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number;
}
