import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TodosService } from './todos.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto, Priority } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoQueryDto, SortBy, SortOrder } from './dto/todo-query.dto';

describe('TodosService', () => {
  let service: TodosService;
  let prisma: PrismaService;

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

  const mockPrismaService = {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo successfully', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'New Todo',
        description: 'New Description',
        priority: Priority.HIGH,
        dueDate: '2024-12-31',
      };

      mockPrismaService.todo.create.mockResolvedValue(mockTodo);

      const result = await service.create(createTodoDto, 'user-1');

      expect(mockPrismaService.todo.create).toHaveBeenCalledWith({
        data: {
          title: 'New Todo',
          description: 'New Description',
          priority: Priority.HIGH,
          dueDate: new Date('2024-12-31'),
          userId: 'user-1',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(mockTodo);
    });

    it('should create a todo without due date', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'New Todo',
        priority: Priority.MEDIUM,
      };

      mockPrismaService.todo.create.mockResolvedValue({
        ...mockTodo,
        dueDate: null,
      });

      await service.create(createTodoDto, 'user-1');

      expect(mockPrismaService.todo.create).toHaveBeenCalledWith({
        data: {
          title: 'New Todo',
          priority: Priority.MEDIUM,
          dueDate: null,
          userId: 'user-1',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated todos with default parameters', async () => {
      const query: TodoQueryDto = {};
      const mockTodos = [mockTodo];
      const mockTotal = 1;

      mockPrismaService.todo.findMany.mockResolvedValue(mockTodos);
      mockPrismaService.todo.count.mockResolvedValue(mockTotal);

      const result = await service.findAll(query, 'user-1');

      expect(result).toEqual({
        todos: mockTodos,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('should filter todos by completed status', async () => {
      const query: TodoQueryDto = { completed: true };

      mockPrismaService.todo.findMany.mockResolvedValue([]);
      mockPrismaService.todo.count.mockResolvedValue(0);

      await service.findAll(query, 'user-1');

      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            completed: true,
          }),
        }),
      );
    });

    it('should filter todos by priority', async () => {
      const query: TodoQueryDto = { priority: Priority.HIGH };

      mockPrismaService.todo.findMany.mockResolvedValue([]);
      mockPrismaService.todo.count.mockResolvedValue(0);

      await service.findAll(query, 'user-1');

      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            priority: Priority.HIGH,
          }),
        }),
      );
    });

    it('should search todos by title and description', async () => {
      const query: TodoQueryDto = { search: 'test' };

      mockPrismaService.todo.findMany.mockResolvedValue([]);
      mockPrismaService.todo.count.mockResolvedValue(0);

      await service.findAll(query, 'user-1');

      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            OR: [
              { title: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      const query: TodoQueryDto = { page: '2', limit: '5' };

      mockPrismaService.todo.findMany.mockResolvedValue([]);
      mockPrismaService.todo.count.mockResolvedValue(10);

      const result = await service.findAll(query, 'user-1');

      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (2-1) * 5
          take: 5,
        }),
      );
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 10,
        totalPages: 2,
      });
    });
  });

  describe('findOne', () => {
    it('should return a todo when found and user owns it', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);

      const result = await service.findOne('todo-1', 'user-1');

      expect(mockPrismaService.todo.findUnique).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(mockTodo);
    });

    it('should throw NotFoundException when todo not found', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own todo', async () => {
      const otherUserTodo = { ...mockTodo, userId: 'other-user' };
      mockPrismaService.todo.findUnique.mockResolvedValue(otherUserTodo);

      await expect(service.findOne('todo-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a todo successfully', async () => {
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Todo',
        priority: Priority.MEDIUM,
      };

      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);
      mockPrismaService.todo.update.mockResolvedValue({
        ...mockTodo,
        ...updateTodoDto,
      });

      const result = await service.update('todo-1', updateTodoDto, 'user-1');

      expect(mockPrismaService.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: {
          title: 'Updated Todo',
          priority: Priority.MEDIUM,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      expect(result.title).toBe('Updated Todo');
    });

    it('should handle due date updates', async () => {
      const updateTodoDto: UpdateTodoDto = {
        dueDate: '2025-01-01',
      };

      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);
      mockPrismaService.todo.update.mockResolvedValue(mockTodo);

      await service.update('todo-1', updateTodoDto, 'user-1');

      expect(mockPrismaService.todo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dueDate: new Date('2025-01-01'),
          }),
        }),
      );
    });

    it('should throw error if todo not found during update', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', {}, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a todo successfully', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);
      mockPrismaService.todo.delete.mockResolvedValue(mockTodo);

      const result = await service.remove('todo-1', 'user-1');

      expect(mockPrismaService.todo.delete).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
      });
      expect(result).toEqual({ message: 'Todo deleted successfully' });
    });

    it('should throw error if todo not found during deletion', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleComplete', () => {
    it('should toggle completion status from false to true', async () => {
      const incompleteTodo = { ...mockTodo, completed: false };
      const completedTodo = { ...mockTodo, completed: true };

      mockPrismaService.todo.findUnique.mockResolvedValue(incompleteTodo);
      mockPrismaService.todo.update.mockResolvedValue(completedTodo);

      const result = await service.toggleComplete('todo-1', 'user-1');

      expect(mockPrismaService.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: { completed: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      expect(result.completed).toBe(true);
    });

    it('should toggle completion status from true to false', async () => {
      const completedTodo = { ...mockTodo, completed: true };
      const incompleteTodo = { ...mockTodo, completed: false };

      mockPrismaService.todo.findUnique.mockResolvedValue(completedTodo);
      mockPrismaService.todo.update.mockResolvedValue(incompleteTodo);

      const result = await service.toggleComplete('todo-1', 'user-1');

      expect(mockPrismaService.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: { completed: false },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      expect(result.completed).toBe(false);
    });
  });

  describe('togglePin', () => {
    it('should toggle pin status', async () => {
      const unpinnedTodo = { ...mockTodo, isPinned: false };
      const pinnedTodo = { ...mockTodo, isPinned: true };

      mockPrismaService.todo.findUnique.mockResolvedValue(unpinnedTodo);
      mockPrismaService.todo.update.mockResolvedValue(pinnedTodo);

      const result = await service.togglePin('todo-1', 'user-1');

      expect(mockPrismaService.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: { isPinned: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      expect(result.isPinned).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      const mockCounts = [10, 6, 4, 2, 5, 3]; // total, completed, pending, high, medium, low
      mockPrismaService.todo.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(6)  // completed
        .mockResolvedValueOnce(4)  // pending
        .mockResolvedValueOnce(2)  // high priority
        .mockResolvedValueOnce(5)  // medium priority
        .mockResolvedValueOnce(3); // low priority

      const result = await service.getStats('user-1');

      expect(result).toEqual({
        total: 10,
        completed: 6,
        pending: 4,
        priority: {
          high: 2,
          medium: 5,
          low: 3,
        },
      });

      expect(mockPrismaService.todo.count).toHaveBeenCalledTimes(6);
      expect(mockPrismaService.todo.count).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(mockPrismaService.todo.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', completed: true },
      });
      expect(mockPrismaService.todo.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', completed: false },
      });
    });
  });

  describe('buildOrderBy (private method testing through findAll)', () => {
    beforeEach(() => {
      mockPrismaService.todo.findMany.mockResolvedValue([]);
      mockPrismaService.todo.count.mockResolvedValue(0);
    });

    it('should sort by created date by default', async () => {
      await service.findAll({}, 'user-1');

      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        }),
      );
    });

    it('should sort by priority when specified', async () => {
      const query: TodoQueryDto = {
        sortBy: SortBy.PRIORITY,
        sortOrder: SortOrder.ASC,
      };

      await service.findAll(query, 'user-1');

      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { isPinned: 'desc' },
            { priority: 'asc' },
            { createdAt: 'desc' },
          ],
        }),
      );
    });

    it('should sort by title when specified', async () => {
      const query: TodoQueryDto = {
        sortBy: SortBy.TITLE,
        sortOrder: SortOrder.ASC,
      };

      await service.findAll(query, 'user-1');

      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { isPinned: 'desc' },
            { title: 'asc' },
            { createdAt: 'desc' },
          ],
        }),
      );
    });

    it('should sort by due date when specified', async () => {
      const query: TodoQueryDto = {
        sortBy: SortBy.DUE_DATE,
        sortOrder: SortOrder.DESC,
      };

      await service.findAll(query, 'user-1');

      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { isPinned: 'desc' },
            { dueDate: 'desc' },
            { createdAt: 'desc' },
          ],
        }),
      );
    });
  });
});