import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTourServicesDto {
  @IsOptional()
  @IsBoolean()
  travel_insurance?: boolean;

  @IsOptional()
  @IsBoolean()
  transport?: boolean;

  @IsOptional()
  @IsBoolean()
  feeding?: boolean;

  @IsOptional()
  @IsBoolean()
  lodging?: boolean;
}

export class UpdateReservationDaysDto {
  @IsOptional()
  @IsBoolean()
  monday?: boolean;

  @IsOptional()
  @IsBoolean()
  tuesday?: boolean;

  @IsOptional()
  @IsBoolean()
  wednesday?: boolean;

  @IsOptional()
  @IsBoolean()
  thursday?: boolean;

  @IsOptional()
  @IsBoolean()
  friday?: boolean;

  @IsOptional()
  @IsBoolean()
  saturday?: boolean;

  @IsOptional()
  @IsBoolean()
  sunday?: boolean;
}

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
  @IsInt()
  supplierId?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateTourServicesDto)
  services?: UpdateTourServicesDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateReservationDaysDto)
  reservation_days?: UpdateReservationDaysDto;
}
