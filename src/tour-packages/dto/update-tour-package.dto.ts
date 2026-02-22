import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateTourPackageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  districtId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  pricePersona?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  days?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  minStudents?: number;

  @IsOptional()
  @IsInt()
  categoryPackageId?: number;

  @IsOptional()
  @IsInt()
  educationLevelId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includes?: string[];

  @IsOptional()
  @IsInt()
  supplierId?: number;
}
