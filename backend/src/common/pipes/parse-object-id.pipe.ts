/**
 * PARSE OBJECT ID PIPE
 * 
 * Custom pipe for validating and transforming object IDs.
 * Demonstrates:
 * 1. Custom pipes in NestJS
 * 2. Data transformation and validation
 * 3. Error handling in pipes
 * 4. Reusable validation logic
 */

import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const id = parseInt(value, 10);
    
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'ID'}: expected a positive integer`
      );
    }
    
    return id;
  }
}

// Alternative with more specific validation
@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const id = parseInt(value, 10);
    
    if (isNaN(id)) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'parameter'}: expected a number`
      );
    }
    
    if (id <= 0) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'parameter'}: must be a positive number`
      );
    }
    
    return id;
  }
}