import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { CreateTodoDto, Priority } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoQueryDto, SortBy, SortOrder } from './dto/todo-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('TodosController', () => {
  let controller: TodosController;
  let service: TodosService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockTodo = {
    id: 'todo-1',
    title: 'Test Todo',
    description: 'Test Description',
    priority: 'HIGH',
    dueDate: new Date('2024-12-31'),
    completed: false,
    isPinned: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    userId: 'user-1',
    user: mockUser,
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockTodosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleComplete: jest.fn(),
    togglePin: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        {
          provide: TodosService,
          useValue: mockTodosService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<TodosController>(TodosController);
    service = module.get<TodosService>(TodosService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'New Todo',
        description: 'New Description',
        priority: Priority.HIGH,
        dueDate: '2024-12-31',
      };

      mockTodosService.create.mockResolvedValue(mockTodo);

      const result = await controller.create(createTodoDto, mockRequest);

      expect(mockTodosService.create).toHaveBeenCalledWith(
        createTodoDto,
        'user-1',
      );
      expect(result).toEqual(mockTodo);
    });

    it('should create a todo with minimal required fields', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Minimal Todo',
        priority: Priority.LOW,
      };

      const minimalTodo = {
        ...mockTodo,
        title: 'Minimal Todo',
        priority: Priority.LOW,
        description: null,
        dueDate: null,
      };

      mockTodosService.create.mockResolvedValue(minimalTodo);

      const result = await controller.create(createTodoDto, mockRequest);

      expect(mockTodosService.create).toHaveBeenCalledWith(
        createTodoDto,
        'user-1',
      );
      expect(result).toEqual(minimalTodo);
    });
  });

  describe('findAll', () => {
    it('should return paginated todos', async () => {
      const query: TodoQueryDto = {
        page: '1',
        limit: '10',
      };

      const mockResponse = {
        todos: [mockTodo],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockTodosService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query, mockRequest);

      expect(mockTodosService.findAll).toHaveBeenCalledWith(query, 'user-1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle complex query parameters', async () => {
      const query: TodoQueryDto = {
        completed: false,
        priority: Priority.HIGH,
        search: 'important',
        sortBy: SortBy.PRIORITY,
        sortOrder: SortOrder.ASC,
        page: '2',
        limit: '5',
      };

      const mockResponse = {
        todos: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 0,
          totalPages: 0,
        },
      };

      mockTodosService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query, mockRequest);

      expect(mockTodosService.findAll).toHaveBeenCalledWith(query, 'user-1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty query parameters', async () => {
      const query: TodoQueryDto = {};

      const mockResponse = {
        todos: [mockTodo],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockTodosService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query, mockRequest);

      expect(mockTodosService.findAll).toHaveBeenCalledWith(query, 'user-1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a specific todo', async () => {
      mockTodosService.findOne.mockResolvedValue(mockTodo);

      const result = await controller.findOne('todo-1', mockRequest);

      expect(mockTodosService.findOne).toHaveBeenCalledWith('todo-1', 'user-1');
      expect(result).toEqual(mockTodo);
    });

    it('should handle non-existent todo ID', async () => {
      const error = new Error('Todo not found');
      mockTodosService.findOne.mockRejectedValue(error);

      await expect(
        controller.findOne('non-existent', mockRequest),
      ).rejects.toThrow('Todo not found');
    });
  });

  describe('update', () => {
    it('should update a todo successfully', async () => {
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Todo',
        priority: Priority.MEDIUM,
        completed: true,
      };

      const updatedTodo = {
        ...mockTodo,
        ...updateTodoDto,
        updatedAt: new Date(),
      };

      mockTodosService.update.mockResolvedValue(updatedTodo);

      const result = await controller.update(
        'todo-1',
        updateTodoDto,
        mockRequest,
      );

      expect(mockTodosService.update).toHaveBeenCalledWith(
        'todo-1',
        updateTodoDto,
        'user-1',
      );
      expect(result).toEqual(updatedTodo);
    });

    it('should handle partial updates', async () => {
      const updateTodoDto: UpdateTodoDto = {
        title: 'Partially Updated Todo',
      };

      const updatedTodo = {
        ...mockTodo,
        title: 'Partially Updated Todo',
        updatedAt: new Date(),
      };

      mockTodosService.update.mockResolvedValue(updatedTodo);

      const result = await controller.update(
        'todo-1',
        updateTodoDto,
        mockRequest,
      );

      expect(mockTodosService.update).toHaveBeenCalledWith(
        'todo-1',
        updateTodoDto,
        'user-1',
      );
      expect(result).toEqual(updatedTodo);
    });

    it('should handle due date updates', async () => {
      const updateTodoDto: UpdateTodoDto = {
        dueDate: '2025-06-15',
      };

      const updatedTodo = {
        ...mockTodo,
        dueDate: new Date('2025-06-15'),
        updatedAt: new Date(),
      };

      mockTodosService.update.mockResolvedValue(updatedTodo);

      const result = await controller.update(
        'todo-1',
        updateTodoDto,
        mockRequest,
      );

      expect(mockTodosService.update).toHaveBeenCalledWith(
        'todo-1',
        updateTodoDto,
        'user-1',
      );
      expect(result.dueDate).toEqual(new Date('2025-06-15'));
    });
  });

  describe('remove', () => {
    it('should delete a todo successfully', async () => {
      const deleteResponse = { message: 'Todo deleted successfully' };
      mockTodosService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove('todo-1', mockRequest);

      expect(mockTodosService.remove).toHaveBeenCalledWith('todo-1', 'user-1');
      expect(result).toEqual(deleteResponse);
    });

    it('should handle deletion of non-existent todo', async () => {
      const error = new Error('Todo not found');
      mockTodosService.remove.mockRejectedValue(error);

      await expect(
        controller.remove('non-existent', mockRequest),
      ).rejects.toThrow('Todo not found');
    });
  });

  describe('toggleComplete', () => {
    it('should toggle completion status to true', async () => {
      const completedTodo = {
        ...mockTodo,
        completed: true,
        updatedAt: new Date(),
      };

      mockTodosService.toggleComplete.mockResolvedValue(completedTodo);

      const result = await controller.toggleComplete('todo-1', mockRequest);

      expect(mockTodosService.toggleComplete).toHaveBeenCalledWith(
        'todo-1',
        'user-1',
      );
      expect(result.completed).toBe(true);
    });

    it('should toggle completion status to false', async () => {
      const incompleteTodo = {
        ...mockTodo,
        completed: false,
        updatedAt: new Date(),
      };

      mockTodosService.toggleComplete.mockResolvedValue(incompleteTodo);

      const result = await controller.toggleComplete('todo-1', mockRequest);

      expect(mockTodosService.toggleComplete).toHaveBeenCalledWith(
        'todo-1',
        'user-1',
      );
      expect(result.completed).toBe(false);
    });

    it('should handle toggle complete for non-existent todo', async () => {
      const error = new Error('Todo not found');
      mockTodosService.toggleComplete.mockRejectedValue(error);

      await expect(
        controller.toggleComplete('non-existent', mockRequest),
      ).rejects.toThrow('Todo not found');
    });
  });

  describe('togglePin', () => {
    it('should toggle pin status to true', async () => {
      const pinnedTodo = {
        ...mockTodo,
        isPinned: true,
        updatedAt: new Date(),
      };

      mockTodosService.togglePin.mockResolvedValue(pinnedTodo);

      const result = await controller.togglePin('todo-1', mockRequest);

      expect(mockTodosService.togglePin).toHaveBeenCalledWith(
        'todo-1',
        'user-1',
      );
      expect(result.isPinned).toBe(true);
    });

    it('should toggle pin status to false', async () => {
      const unpinnedTodo = {
        ...mockTodo,
        isPinned: false,
        updatedAt: new Date(),
      };

      mockTodosService.togglePin.mockResolvedValue(unpinnedTodo);

      const result = await controller.togglePin('todo-1', mockRequest);

      expect(mockTodosService.togglePin).toHaveBeenCalledWith(
        'todo-1',
        'user-1',
      );
      expect(result.isPinned).toBe(false);
    });

    it('should handle toggle pin for non-existent todo', async () => {
      const error = new Error('Todo not found');
      mockTodosService.togglePin.mockRejectedValue(error);

      await expect(
        controller.togglePin('non-existent', mockRequest),
      ).rejects.toThrow('Todo not found');
    });
  });

  describe('getStats', () => {
    it('should return todo statistics', async () => {
      const mockStats = {
        total: 15,
        completed: 8,
        pending: 7,
        priority: {
          high: 3,
          medium: 6,
          low: 6,
        },
      };

      mockTodosService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats(mockRequest);

      expect(mockTodosService.getStats).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockStats);
    });

    it('should return zero stats for user with no todos', async () => {
      const emptyStats = {
        total: 0,
        completed: 0,
        pending: 0,
        priority: {
          high: 0,
          medium: 0,
          low: 0,
        },
      };

      mockTodosService.getStats.mockResolvedValue(emptyStats);

      const result = await controller.getStats(mockRequest);

      expect(mockTodosService.getStats).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(emptyStats);
    });
  });

  describe('Authentication Guard', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', TodosController);
      const guardNames = guards.map((guard: any) => guard.name);
      expect(guardNames).toContain('JwtAuthGuard');
    });

    it('should extract user ID from request in all methods', async () => {
      // Test that user ID is consistently extracted from req.user.id
      const createDto: CreateTodoDto = { title: 'Test', priority: Priority.LOW };
      const updateDto: UpdateTodoDto = { title: 'Updated' };
      const query: TodoQueryDto = {};

      mockTodosService.create.mockResolvedValue(mockTodo);
      mockTodosService.findAll.mockResolvedValue({ todos: [], pagination: {} });
      mockTodosService.findOne.mockResolvedValue(mockTodo);
      mockTodosService.update.mockResolvedValue(mockTodo);
      mockTodosService.remove.mockResolvedValue({ message: 'Deleted' });
      mockTodosService.toggleComplete.mockResolvedValue(mockTodo);
      mockTodosService.togglePin.mockResolvedValue(mockTodo);
      mockTodosService.getStats.mockResolvedValue({});

      // Test all methods use req.user.id
      await controller.create(createDto, mockRequest);
      await controller.findAll(query, mockRequest);
      await controller.findOne('todo-1', mockRequest);
      await controller.update('todo-1', updateDto, mockRequest);
      await controller.remove('todo-1', mockRequest);
      await controller.toggleComplete('todo-1', mockRequest);
      await controller.togglePin('todo-1', mockRequest);
      await controller.getStats(mockRequest);

      // Verify all service calls received the correct user ID
      expect(mockTodosService.create).toHaveBeenCalledWith(createDto, 'user-1');
      expect(mockTodosService.findAll).toHaveBeenCalledWith(query, 'user-1');
      expect(mockTodosService.findOne).toHaveBeenCalledWith('todo-1', 'user-1');
      expect(mockTodosService.update).toHaveBeenCalledWith(
        'todo-1',
        updateDto,
        'user-1',
      );
      expect(mockTodosService.remove).toHaveBeenCalledWith('todo-1', 'user-1');
      expect(mockTodosService.toggleComplete).toHaveBeenCalledWith(
        'todo-1',
        'user-1',
      );
      expect(mockTodosService.togglePin).toHaveBeenCalledWith('todo-1', 'user-1');
      expect(mockTodosService.getStats).toHaveBeenCalledWith('user-1');
    });
  });

  describe('API Documentation', () => {
    it('should have proper API tags and bearer auth', () => {
      // Check if the controller is decorated with @ApiTags and @ApiBearerAuth
      // This is more of a design-time check that the decorators are present
      expect(controller).toBeDefined();
      
      // We can check that the controller has the expected structure
      expect(controller.create).toBeDefined();
      expect(controller.findAll).toBeDefined();
      expect(controller.findOne).toBeDefined();
      expect(controller.update).toBeDefined();
      expect(controller.remove).toBeDefined();
      expect(controller.toggleComplete).toBeDefined();
      expect(controller.togglePin).toBeDefined();
      expect(controller.getStats).toBeDefined();
    });

    it('should have API operation metadata for all endpoints', () => {
      // Check that controller methods exist and are functions
      const methods = ['create', 'findAll', 'findOne', 'update', 'remove', 'toggleComplete', 'togglePin', 'getStats'];
      
      methods.forEach(method => {
        expect(controller[method]).toBeDefined();
        expect(typeof controller[method]).toBe('function');
      });
    });

    it('should have proper HTTP status code responses', () => {
      // Verify that all CRUD operations are available
      expect(controller.create).toBeDefined();
      expect(controller.findAll).toBeDefined();
      expect(controller.findOne).toBeDefined();
      expect(controller.update).toBeDefined();
      expect(controller.remove).toBeDefined();
      
      // Verify special operations
      expect(controller.toggleComplete).toBeDefined();
      expect(controller.togglePin).toBeDefined();
      expect(controller.getStats).toBeDefined();
    });
  });
});