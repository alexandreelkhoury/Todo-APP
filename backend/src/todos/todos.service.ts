import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoQueryDto, SortBy, SortOrder } from './dto/todo-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto, userId: string) {
    const { dueDate, ...rest } = createTodoDto;
    
    return this.prisma.todo.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
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
  }

  async findAll(query: TodoQueryDto, userId: string) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const where: Prisma.TodoWhereInput = {
      userId,
      ...(query.completed !== undefined && { completed: query.completed }),
      ...(query.priority && { priority: query.priority }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy = this.buildOrderBy(
      query.sortBy || SortBy.CREATED_AT,
      query.sortOrder || SortOrder.DESC,
    );

    const [todos, total] = await Promise.all([
      this.prisma.todo.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.todo.count({ where }),
    ]);

    return {
      todos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
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

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException('Access denied to this todo');
    }

    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string) {
    const todo = await this.findOne(id, userId);
    
    const { dueDate, ...rest } = updateTodoDto;

    return this.prisma.todo.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined && { 
          dueDate: dueDate ? new Date(dueDate) : null 
        }),
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
  }

  async remove(id: string, userId: string) {
    const todo = await this.findOne(id, userId);

    await this.prisma.todo.delete({
      where: { id },
    });

    return { message: 'Todo deleted successfully' };
  }

  async toggleComplete(id: string, userId: string) {
    const todo = await this.findOne(id, userId);

    return this.prisma.todo.update({
      where: { id },
      data: {
        completed: !todo.completed,
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
  }

  async togglePin(id: string, userId: string) {
    const todo = await this.findOne(id, userId);

    return this.prisma.todo.update({
      where: { id },
      data: {
        isPinned: !todo.isPinned,
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
  }

  async getStats(userId: string) {
    const [total, completed, pending, high, medium, low] = await Promise.all([
      this.prisma.todo.count({ where: { userId } }),
      this.prisma.todo.count({ where: { userId, completed: true } }),
      this.prisma.todo.count({ where: { userId, completed: false } }),
      this.prisma.todo.count({ where: { userId, priority: 'HIGH' } }),
      this.prisma.todo.count({ where: { userId, priority: 'MEDIUM' } }),
      this.prisma.todo.count({ where: { userId, priority: 'LOW' } }),
    ]);

    return {
      total,
      completed,
      pending,
      priority: {
        high,
        medium,
        low,
      },
    };
  }

  private buildOrderBy(sortBy: SortBy, sortOrder: SortOrder): Prisma.TodoOrderByWithRelationInput[] {
    const order = (sortOrder === SortOrder.ASC ? 'asc' : 'desc') as Prisma.SortOrder;

    // Always sort by pinned first
    const baseOrder: Prisma.TodoOrderByWithRelationInput[] = [{ isPinned: 'desc' }];

    switch (sortBy) {
      case SortBy.PRIORITY:
        return [...baseOrder, { priority: order }, { createdAt: 'desc' }];
      case SortBy.DUE_DATE:
        return [...baseOrder, { dueDate: order }, { createdAt: 'desc' }];
      case SortBy.TITLE:
        return [...baseOrder, { title: order }, { createdAt: 'desc' }];
      case SortBy.CREATED_AT:
      default:
        return [...baseOrder, { createdAt: order }];
    }
  }
}