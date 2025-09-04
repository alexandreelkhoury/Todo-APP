/**
 * AUTHENTICATION SERVICE
 * 
 * Contains the business logic for authentication operations in the todo application.
 * Simplified for the Maxiphy assessment requirements.
 */

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials (used by LocalStrategy)
   */
  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    return this.usersService.validateCredentials(email, password);
  }

  /**
   * User registration
   */
  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    
    // Generate JWT token for immediate login
    const token = this.generateJwtToken(user);

    return {
      user,
      access_token: token,
      token_type: 'Bearer',
      expires_in: '1d',
      message: 'User registered successfully',
    };
  }

  /**
   * User login - generates JWT token
   */
  async login(user: UserEntity) {
    const token = this.generateJwtToken(user);
    
    return {
      user,
      access_token: token,
      token_type: 'Bearer',
      expires_in: '1d',
      message: 'Login successful',
    };
  }

  /**
   * Generate JWT token with user payload
   */
  private generateJwtToken(user: UserEntity): string {
    const payload = {
      sub: user.id, // Standard JWT claim for user ID
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000), // Issued at timestamp
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Validate JWT token (used by JwtStrategy)
   */
  async validateJwtPayload(payload: any) {
    try {
      const user = await this.usersService.findOne(payload.sub);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}