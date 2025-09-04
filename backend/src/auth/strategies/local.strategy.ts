/**
 * LOCAL AUTHENTICATION STRATEGY
 * 
 * This strategy handles username/password authentication.
 * Passport strategies in NestJS:
 * 1. Extend PassportStrategy class
 * 2. Implement validate() method
 * 3. Return user object if valid, null if invalid
 * 4. Used by LocalAuthGuard
 */

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Use email instead of username
      passwordField: 'password',
    });
  }

  /**
   * Validate method is called automatically by Passport
   * @param email - User's email from request body
   * @param password - User's password from request body
   * @returns User object if valid, throws UnauthorizedException if invalid
   */
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    return user; // This will be attached to req.user
  }
}