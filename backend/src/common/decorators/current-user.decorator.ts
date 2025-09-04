/**
 * CURRENT USER DECORATOR
 * 
 * Custom parameter decorator to extract user from request.
 * Demonstrates:
 * 1. Custom decorators in NestJS
 * 2. ExecutionContext usage
 * 3. Request data extraction
 * 4. Type safety with decorators
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a specific property is requested, return just that property
    if (data && user) {
      return user[data];
    }

    // Otherwise return the entire user object
    return user;
  },
);

// Usage examples:
// @Get('profile')
// getProfile(@CurrentUser() user: User) { ... }
//
// @Get('profile')
// getProfile(@CurrentUser('id') userId: number) { ... }