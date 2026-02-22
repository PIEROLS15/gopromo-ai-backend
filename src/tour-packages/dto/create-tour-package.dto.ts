import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTourPackageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  districtId: number;

  @IsNumber()
  @IsPositive()
  pricePersona: number;

  @IsInt()
  @IsPositive()
  days: number;

  @IsInt()
  @IsPositive()
  minStudents: number;

  @IsInt()
  categoryPackageId: number;

  @IsInt()
  educationLevelId: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  activities: string[];

  @IsArray()
  @IsString({ each: true })
  includes: string[];

  @IsInt()
  supplierId: number;
}
