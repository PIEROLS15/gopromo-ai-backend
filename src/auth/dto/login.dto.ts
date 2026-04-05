import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'email must be an email' })
  email: string;

  @IsNotEmpty({ message: 'password is required' })
  password: string;
}
