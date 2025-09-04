# NestJS Core Concepts Explained

## 1. Modules 📦

Modules are the fundamental building blocks of NestJS applications. They organize code into cohesive feature sets.

### Key Points:
- **@Module()** decorator defines a module
- **imports**: Other modules this module needs
- **controllers**: HTTP request handlers  
- **providers**: Services, repositories, guards, etc.
- **exports**: Makes providers available to other modules

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Other modules can inject UsersService
})
export class UsersModule {}
```

## 2. Controllers 🎮

Controllers handle incoming HTTP requests and return responses.

### Key Features:
- **@Controller()** decorator defines base route
- **@Get(), @Post(), @Put(), @Delete()** for HTTP methods
- **@Param(), @Body(), @Query()** extract request data
- **@UseGuards(), @UseInterceptors()** apply middleware

```typescript
@Controller('users')
export class UsersController {
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
}
```

## 3. Services (Providers) 🔧

Services contain business logic and are injected into controllers.

### Key Points:
- **@Injectable()** makes a class available for DI
- Pure business logic, no HTTP concerns
- Reusable across different controllers
- Can inject other services

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}
```

## 4. Dependency Injection (DI) 💉

NestJS automatically manages object creation and dependencies.

### How it Works:
1. **@Injectable()** marks classes as injectable
2. Constructor parameters define dependencies  
3. NestJS container resolves and injects dependencies
4. Singleton pattern by default (can be scoped)

```typescript
// Service depends on repository
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,    // Auto-injected
    private jwtService: JwtService,        // Auto-injected
  ) {}
}
```

## 5. Guards 🛡️

Guards determine if a request should proceed based on conditions.

### Use Cases:
- **Authentication**: Is user logged in?
- **Authorization**: Does user have required role?
- **Business logic**: Custom access rules

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Usage
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user; // Populated by guard
}
```

## 6. Interceptors 🔄

Interceptors transform requests/responses and add cross-cutting concerns.

### Common Uses:
- **Logging**: Track requests/responses
- **Transformation**: Modify data format
- **Caching**: Store/retrieve cached responses
- **Timing**: Measure execution time

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    console.log('Before request...');
    
    return next.handle().pipe(
      tap(data => console.log('After request...'))
    );
  }
}
```

## 7. Pipes 🔧

Pipes transform and validate input data.

### Built-in Pipes:
- **ValidationPipe**: Validates DTOs
- **ParseIntPipe**: Converts strings to numbers
- **ParseBoolPipe**: Converts strings to booleans

```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  // id is guaranteed to be a number
  return this.service.findOne(id);
}
```

## 8. Exception Filters 🚨

Filters catch and handle exceptions globally or per route.

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    response.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
```

## 9. Middleware 🔗

Middleware functions execute before route handlers.

### Examples:
- **Authentication**: Verify tokens
- **Logging**: Log requests
- **CORS**: Handle cross-origin requests
- **Rate limiting**: Prevent abuse

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url}`);
    next();
  }
}
```

## 10. DTOs (Data Transfer Objects) 📋

DTOs define the shape and validation rules for request/response data.

```typescript
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
```

## 11. Execution Order 🔄

Understanding the request/response lifecycle:

```
1. Middleware
2. Guards  
3. Interceptors (before)
4. Pipes
5. Controller Method
6. Interceptors (after)
7. Exception Filters
```

## 12. TypeORM Integration 🗄️

NestJS integrates seamlessly with TypeORM for database operations.

```typescript
// Entity
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;
}

// Service
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
}
```

## 13. Testing 🧪

NestJS provides excellent testing utilities.

```typescript
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## 14. Configuration 🔧

Environment-specific configuration management.

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}
```

## 15. Swagger Integration 📚

Auto-generate API documentation.

```typescript
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // Implementation
  }
}
```

---

## Interview Preparation Tips 💡

### Must-Know Concepts:
1. **Dependency Injection**: How it works, benefits, scoping
2. **Module System**: Feature modules, shared modules, dynamic modules
3. **Guards vs Interceptors**: When to use each, execution order
4. **Exception Handling**: Global filters, custom exceptions
5. **Validation**: DTOs, pipes, class-validator integration

### Common Questions:
- "How does NestJS differ from Express?"
- "Explain the request lifecycle in NestJS"
- "How would you implement authentication?"
- "What are the benefits of dependency injection?"
- "How do you handle database transactions?"

### Best Practices:
- Separate business logic into services
- Use DTOs for all input/output
- Implement proper error handling
- Follow single responsibility principle
- Write comprehensive tests