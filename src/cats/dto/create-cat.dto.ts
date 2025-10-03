import { IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  @Max(30)
  @Type(() => Number)
  age: number;

  @IsString()
  breed: string;
}
