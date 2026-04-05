import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RegisterSupplierDto {
  @IsEmail({}, { message: 'email must be an email' })
  email: string;

  @Matches(/^\d{11}$/, { message: 'ruc must be 11 digits' })
  ruc: string;

  @IsNotEmpty()
  representativeName: string;

  @IsNotEmpty()
  companyName: string;

  @IsNotEmpty()
  phone: string;

  @MinLength(8, { message: 'password must be at least 8 characters' })
  password: string;
}
