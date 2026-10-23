import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate as isUuid } from 'uuid';

// Try to custom ParseUUIDPipe that built-in NestJS pipe
@Injectable()
export class ParseUUIDCustomPipe implements PipeTransform {
  transform(value: string) {
    if (!isUuid(value)) {
      throw new BadRequestException(`Invalid UUID: ${value}`);
    }
    return value;
  }
}
