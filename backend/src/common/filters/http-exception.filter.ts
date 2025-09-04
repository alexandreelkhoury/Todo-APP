/**
 * HTTP EXCEPTION FILTER
 * 
 * Global exception handler that standardizes error responses.
 * Demonstrates:
 * 1. Exception filters in NestJS
 * 2. Custom error response formatting
 * 3. Error logging
 * 4. Environment-specific error details
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any).details || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      details = process.env.NODE_ENV === 'development' ? exception.stack : null;
    }

    // Log the error
    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      exception instanceof Error ? exception.stack : 'No stack trace',
      `${request.method} ${request.url}`
    );

    const errorResponse = {
      success: false,
      error: {
        statusCode: status,
        message,
        details,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
    };

    response.status(status).json(errorResponse);
  }
}