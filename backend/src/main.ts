/**
 * NESTJS MAIN APPLICATION ENTRY POINT
 * 
 * This is where the NestJS application bootstraps. Key concepts:
 * 
 * 1. Bootstrap Function: Creates the application instance
 * 2. Global Pipes: Validation and transformation of incoming data
 * 3. CORS: Cross-Origin Resource Sharing configuration
 * 4. Swagger: API documentation setup
 * 5. Global Prefix: API versioning through URL prefix
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);

  // Global API prefix (all routes will be prefixed with /api/v1)
  app.setGlobalPrefix('api/v1');

  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe - automatically validates DTOs
  // transform: true converts plain objects to class instances
  // whitelist: true strips properties not defined in DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger API Documentation Configuration
  const config = new DocumentBuilder()
    .setTitle('Maxiphy Todo API')
    .setDescription('Todo application backend API built with NestJS for Maxiphy assessment')
    .setVersion('1.0')
    .addBearerAuth() // JWT authentication
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management operations')
    .addTag('Todos', 'Todo management operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();