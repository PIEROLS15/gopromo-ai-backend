import { IsNotEmpty, IsString } from 'class-validator';

export class SearchTourPackageDto {
  @IsString()
  @IsNotEmpty()
  keyword: string;
}
