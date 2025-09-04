/**
 * LOCAL AUTHENTICATION GUARD
 * 
 * Guards control access to routes. This guard:
 * 1. Uses LocalStrategy to validate credentials
 * 2. Automatically validates username/password from request body
 * 3. Populates req.user with validated user data
 * 4. Throws UnauthorizedException if credentials are invalid
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // This guard uses the 'local' strategy
  // No additional logic needed - base class handles everything
}