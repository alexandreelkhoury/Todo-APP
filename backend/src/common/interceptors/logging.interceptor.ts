/**
 * LOGGING INTERCEPTOR
 * 
 * Logs HTTP requests and responses for monitoring and debugging.
 * Demonstrates:
 * 1. NestJS Interceptors
 * 2. RxJS operators (tap, catchError)
 * 3. Request/Response transformation
 * 4. Error handling in interceptors
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, user } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;

    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - User: ${user?.email || 'Anonymous'} - IP: ${ip} - UserAgent: ${userAgent}`
    );

    // Log request body for POST/PUT/PATCH requests (excluding sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        this.logger.log(
          `Outgoing Response: ${method} ${url} - Status: ${response.statusCode} - Duration: ${duration}ms`
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `Request Failed: ${method} ${url} - Error: ${error.message} - Duration: ${duration}ms`,
          error.stack
        );
        return throwError(() => error);
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}