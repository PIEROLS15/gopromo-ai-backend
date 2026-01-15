import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @IsEmail({}, { message: 'email must be an email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'phone is required' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'subject is required' })
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'message is required' })
  message: string;
}
