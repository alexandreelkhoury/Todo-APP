/**
 * AUTHENTICATION CONTROLLER
 * 
 * Handles HTTP requests for authentication operations:
 * - POST /auth/register - User registration
 * - POST /auth/login - User login
 * - GET /auth/profile - Get current user profile (protected)
 * 
 * Key NestJS concepts demonstrated:
 * 1. Guards: @UseGuards() for route protection
 * 2. Decorators: Custom decorators for extracting user data
 * 3. DTOs: Data Transfer Objects for request validation
 * 4. Swagger: API documentation annotations
 */

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'Conflict - email already exists' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard) // Validates username/password
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    // LocalAuthGuard populates req.user with validated user
    return this.authService.login(req.user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard) // Validates JWT token
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  getProfile(@Request() req) {
    // JwtAuthGuard populates req.user with JWT payload
    return {
      user: req.user,
      message: 'Profile retrieved successfully',
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refreshToken(@Request() req) {
    return this.authService.login(req.user);
  }
}