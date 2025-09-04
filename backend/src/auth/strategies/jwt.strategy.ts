/**
 * JWT AUTHENTICATION STRATEGY
 * 
 * This strategy validates JWT tokens from the Authorization header.
 * Process:
 * 1. Extract JWT token from "Bearer <token>" header
 * 2. Verify token signature and expiration
 * 3. Extract payload and validate user
 * 4. Attach user to request object
 */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      // Extract JWT from Authorization header as Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Reject expired tokens
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Validate JWT payload
   * This method is called after the token is successfully verified
   * @param payload - Decoded JWT payload
   * @returns User object to be attached to req.user
   */
  async validate(payload: any) {
    // Payload contains: { sub: userId, email, role, iat, exp }
    try {
      const user = await this.authService.validateJwtPayload(payload);
      return user; // This will be attached to req.user
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}