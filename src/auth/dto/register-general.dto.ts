import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterGeneralDto {
  @IsEmail({}, { message: 'email must be an email' })
  email: string;

  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  educationalInstitution?: string;

  @IsOptional()
  phone?: string;

  @MinLength(8, { message: 'password must be at least 8 characters' })
  password: string;
}
