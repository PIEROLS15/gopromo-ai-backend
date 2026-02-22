import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;
}
