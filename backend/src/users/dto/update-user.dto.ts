/**
 * UPDATE USER DTO
 * 
 * Partial update DTO for user information.
 * Omits password for security - password changes should use a separate endpoint.
 */

import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}