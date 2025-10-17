import { IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ApiExtraModels } from '@nestjs/swagger';

class ExtraModel {
  @ApiProperty({ example: 'extra', description: 'An extra property' })
  @IsString()
  extraProp: string;
} // Example extra model for demonstration

@ApiExtraModels(ExtraModel)
export class CreateCatDto {
  @ApiProperty({ example: 'Whiskers', description: 'The name of the cat' })
  @IsString()
  name: string;

  @ApiProperty({ example: 3, description: 'The age of the cat in years' })
  @IsInt()
  @Min(0)
  @Max(30)
  @Type(() => Number)
  age: number;

  @ApiProperty({ example: 'Siamese', description: 'The breed of the cat' })
  @IsString()
  breed: string;
}
