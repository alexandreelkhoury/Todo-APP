import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoQueryDto } from './dto/todo-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Todos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo item' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Todo item created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  create(@Body() createTodoDto: CreateTodoDto, @Request() req) {
    return this.todosService.create(createTodoDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all todo items for the authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of todo items with pagination',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  findAll(@Query() query: TodoQueryDto, @Request() req) {
    return this.todosService.findAll(query, req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get todo statistics for the authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo statistics',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  getStats(@Request() req) {
    return this.todosService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific todo item by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo item found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Todo item not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this todo item',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.todosService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo item' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo item updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Todo item not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this todo item',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req,
  ) {
    return this.todosService.update(id, updateTodoDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo item' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo item deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Todo item not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this todo item',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.todosService.remove(id, req.user.id);
  }

  @Patch(':id/toggle-complete')
  @ApiOperation({ summary: 'Toggle completion status of a todo item' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo completion status toggled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Todo item not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this todo item',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  toggleComplete(@Param('id') id: string, @Request() req) {
    return this.todosService.toggleComplete(id, req.user.id);
  }

  @Patch(':id/toggle-pin')
  @ApiOperation({ summary: 'Toggle pin status of a todo item' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo pin status toggled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Todo item not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this todo item',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  togglePin(@Param('id') id: string, @Request() req) {
    return this.todosService.togglePin(id, req.user.id);
  }
}