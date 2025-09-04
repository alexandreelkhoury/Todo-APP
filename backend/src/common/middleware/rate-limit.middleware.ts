/**
 * RATE LIMITING MIDDLEWARE
 * 
 * Simple in-memory rate limiting for API protection.
 * Demonstrates:
 * 1. Custom middleware implementation
 * 2. Rate limiting logic
 * 3. IP-based throttling
 * 4. Configurable limits
 * 
 * Note: In production, use Redis-based solutions like @nestjs/throttler
 */

import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly maxRequests = 100; // Max requests per window

  use(req: Request, res: Response, next: NextFunction) {
    const key = req.ip; // Use IP as key
    const now = Date.now();

    // Clean up expired entries
    this.cleanup(now);

    // Get or create entry for this IP
    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    const entry = this.store[key];

    // Reset counter if window has expired
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + this.windowMs;
    }

    // Increment counter
    entry.count++;

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': this.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, this.maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
    });

    // Check if limit exceeded
    if (entry.count > this.maxRequests) {
      throw new HttpException(
        {
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    next();
  }

  private cleanup(now: number) {
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime + this.windowMs) {
        delete this.store[key];
      }
    });
  }
}