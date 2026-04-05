import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEducationLevelDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;
}
