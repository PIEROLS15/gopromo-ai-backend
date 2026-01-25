import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSupplierDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  ruc: string;

  @IsString()
  @IsNotEmpty()
  representativeName: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
