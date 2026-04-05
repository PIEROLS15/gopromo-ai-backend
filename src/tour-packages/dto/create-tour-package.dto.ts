import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsPositive,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTourItineraryStepDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  hour: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  order: number;
}

export class CreateTourItineraryDayDto {
  @IsInt()
  @Min(1)
  day: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTourItineraryStepDto)
  steps: CreateTourItineraryStepDto[];
}

export class CreateTourServicesDto {
  @IsBoolean()
  travel_insurance: boolean;

  @IsBoolean()
  transport: boolean;

  @IsBoolean()
  feeding: boolean;

  @IsBoolean()
  lodging: boolean;
}

export class CreateReservationDaysDto {
  @IsBoolean()
  monday: boolean;

  @IsBoolean()
  tuesday: boolean;

  @IsBoolean()
  wednesday: boolean;

  @IsBoolean()
  thursday: boolean;

  @IsBoolean()
  friday: boolean;

  @IsBoolean()
  saturday: boolean;

  @IsBoolean()
  sunday: boolean;
}

export class CreateItineraryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTourItineraryDayDto)
  days: CreateTourItineraryDayDto[];
}

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

  @IsInt()
  supplierId: number;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateTourServicesDto)
  services: CreateTourServicesDto;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateReservationDaysDto)
  reservation_days: CreateReservationDaysDto;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateItineraryDto)
  itinerary: CreateItineraryDto;
}
