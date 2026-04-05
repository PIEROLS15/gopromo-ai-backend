import { IsOptional, IsString } from 'class-validator';

export class UpdateSupplierPartialDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
