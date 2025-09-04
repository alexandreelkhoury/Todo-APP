# NestJS E-Commerce API

A comprehensive e-commerce backend API built with NestJS, demonstrating enterprise-level patterns and best practices.

## 🚀 Features

### Core Functionality
- **User Management**: Registration, authentication, profile management, role-based access
- **Product Catalog**: CRUD operations, inventory management, search and filtering
- **Order Processing**: Complete order lifecycle with stock management
- **Authentication**: JWT-based auth with passport strategies

### Advanced Features
- **Role-Based Access Control (RBAC)**: Admin, Moderator, User roles
- **Stock Management**: Reservation, fulfillment, and inventory tracking
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Request Validation**: DTO validation with class-validator
- **Error Handling**: Global exception filters with standardized responses
- **Logging**: Comprehensive request/response logging
- **Rate Limiting**: API protection with configurable limits

## 🏗️ Architecture Overview

### Module Structure
```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application entry point
├── config/                    # Configuration files
├── auth/                      # Authentication module
│   ├── auth.module.ts
│   ├── auth.service.ts        # JWT & password logic
│   ├── auth.controller.ts     # Login/register endpoints
│   ├── strategies/            # Passport strategies
│   └── guards/               # Auth guards
├── users/                     # User management
│   ├── users.module.ts
│   ├── users.service.ts       # User business logic
│   ├── users.controller.ts    # User CRUD endpoints
│   ├── entities/              # TypeORM entities
│   └── dto/                  # Data transfer objects
├── products/                  # Product catalog
│   ├── products.module.ts
│   ├── products.service.ts    # Product & inventory logic
│   ├── products.controller.ts # Product CRUD endpoints
│   ├── entities/
│   └── dto/
├── orders/                    # Order processing
│   ├── orders.module.ts
│   ├── orders.service.ts      # Order lifecycle logic
│   ├── orders.controller.ts   # Order endpoints
│   ├── entities/
│   └── dto/
└── common/                    # Shared components
    ├── guards/               # Custom guards
    ├── interceptors/         # Request/response interceptors
    ├── filters/              # Exception filters
    ├── middleware/           # Custom middleware
    ├── decorators/           # Custom decorators
    └── pipes/                # Custom pipes
```

### Key NestJS Concepts Demonstrated

#### 1. Dependency Injection
```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
}
```

#### 2. Decorators & Metadata
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {}
}
```

#### 3. Guards & Authorization
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get('roles', context.getHandler());
    return requiredRoles.some(role => user.role === role);
  }
}
```

#### 4. Interceptors
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      tap(data => this.logger.log('Request completed'))
    );
  }
}
```

#### 5. Custom Decorators
```typescript
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
  },
);
```

## 📊 Database Schema

### User Entity
- **Fields**: id, firstName, lastName, email, password, role, phone, address
- **Relationships**: One-to-many with orders
- **Features**: Role-based access, password hashing, timestamps

### Product Entity  
- **Fields**: id, name, description, sku, price, stockQuantity, category, status
- **Features**: Inventory management, search optimization, computed properties
- **Enums**: ProductCategory, ProductStatus

### Order & OrderItem Entities
- **Features**: Complete order lifecycle, stock reservation, status transitions
- **Relationships**: Many-to-one with users, one-to-many with order items
- **Business Logic**: Automatic total calculations, stock management

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd nestjs-ecommerce-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

4. **Database Setup**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE nestjs_ecommerce;
```

5. **Start the application**
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login  
- `GET /api/v1/auth/profile` - Get current user profile

### Users
- `GET /api/v1/users` - List all users (Admin)
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update current user
- `POST /api/v1/users/change-password` - Change password

### Products
- `GET /api/v1/products` - List products with filtering
- `POST /api/v1/products` - Create product (Admin)
- `GET /api/v1/products/:id` - Get product by ID
- `PATCH /api/v1/products/:id` - Update product (Admin)
- `GET /api/v1/products/popular` - Get popular products

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/my-orders` - Get current user orders
- `GET /api/v1/orders/:id` - Get order by ID
- `POST /api/v1/orders/:id/cancel` - Cancel order

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=nestjs_ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d

# Application
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Swagger Documentation
Access the interactive API documentation at:
```
http://localhost:3001/api/docs
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📈 Production Considerations

### Performance Optimizations
- Database indexing on frequently queried fields
- Connection pooling for database connections
- Response caching with Redis (recommended)
- CDN for static assets

### Security Best Practices
- JWT token expiration and refresh
- Rate limiting implementation
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers

### Monitoring & Logging
- Application metrics with Prometheus
- Log aggregation with ELK stack
- Health checks and status endpoints
- Error tracking with Sentry

## 🤔 Interview Preparation Tips

### Key NestJS Concepts to Understand

1. **Dependency Injection Container**
   - How NestJS manages dependencies
   - Provider registration and scoping
   - Custom providers and factories

2. **Module System**  
   - Feature modules vs shared modules
   - Module imports/exports
   - Dynamic modules

3. **Guards vs Interceptors vs Middleware**
   - Execution order and use cases
   - When to use each pattern
   - Custom implementations

4. **Exception Handling**
   - Global vs route-level filters
   - Custom exception types
   - Error response standardization

5. **Validation & Transformation**
   - DTO patterns with class-validator
   - Custom pipes and transformers
   - Request/response serialization

### Common Interview Questions

**Q: How does NestJS handle dependency injection?**
A: NestJS uses a powerful DI container that manages object lifecycles and dependencies. Dependencies are resolved at runtime using TypeScript metadata and decorators like `@Injectable()`.

**Q: What's the difference between guards and interceptors?**
A: Guards determine if a request should be handled (authentication/authorization), while interceptors can transform requests/responses and add cross-cutting concerns like logging.

**Q: How do you handle database transactions in NestJS?**
A: Use TypeORM's transaction manager or QueryRunner for manual transactions, or leverage NestJS's `@Transaction()` decorator for automatic transaction management.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*This is a comprehensive NestJS example showcasing enterprise-level patterns and best practices for e-commerce applications.*