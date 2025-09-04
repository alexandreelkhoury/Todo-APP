/**
 * USERS MODULE
 * 
 * Feature module for user management operations in the todo application.
 * Uses Prisma for database operations.
 */

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService], // Export service for use in AuthModule
})
export class UsersModule {}