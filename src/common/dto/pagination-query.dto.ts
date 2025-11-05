import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../constants/pagination.constant';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = DEFAULT_OFFSET; // starting index

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = DEFAULT_LIMIT; // number of items per page
}
