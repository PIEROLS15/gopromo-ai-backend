import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryPackageDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;
}
