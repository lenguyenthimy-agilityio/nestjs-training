import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Min, IsString } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0; // starting index

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 10; // number of items per page
}
