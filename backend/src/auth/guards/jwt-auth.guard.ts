/**
 * JWT AUTHENTICATION GUARD
 * 
 * This guard protects routes that require authentication:
 * 1. Extracts JWT token from Authorization header
 * 2. Validates token using JwtStrategy
 * 3. Populates req.user with decoded user data
 * 4. Allows access if token is valid, denies if invalid/missing
 * 
 * Usage: @UseGuards(JwtAuthGuard) on controllers or routes
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // This guard uses the 'jwt' strategy
  // Base class handles token extraction and validation
}