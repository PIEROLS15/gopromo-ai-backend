import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCategoryPackageDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;
}
