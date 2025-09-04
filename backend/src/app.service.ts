import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to NestJS E-Commerce API! Visit /api/docs for Swagger documentation.';
  }
}