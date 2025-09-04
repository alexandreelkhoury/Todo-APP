/**
 * ROOT APPLICATION MODULE
 * 
 * Main module for the Maxiphy Todo Application.
 * This module orchestrates all the feature modules for the todo app.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TodosModule } from './todos/todos.module';

// Database Service
import { PrismaService } from './prisma/prisma.service';

// Main App Controller
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration Module - Loads environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available throughout the app
      envFilePath: '.env',
    }),

    // JWT Global Configuration
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'maxiphy-super-secret-jwt-key-change-in-production',
      signOptions: { expiresIn: '1d' },
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    TodosModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}