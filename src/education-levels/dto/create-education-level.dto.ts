import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEducationLevelDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;
}
