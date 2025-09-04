import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export class CreateTodoDto {
  @ApiProperty({
    description: 'The title of the todo item',
    example: 'Complete project documentation',
    minLength: 1,
  })
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the todo item',
    example: 'Write comprehensive documentation for the project including API endpoints and setup instructions',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Priority level of the todo item',
    enum: Priority,
    example: Priority.MEDIUM,
    default: Priority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority = Priority.MEDIUM;

  @ApiPropertyOptional({
    description: 'Due date for the todo item (ISO string)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Whether the todo item is pinned to the top',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean = false;
}