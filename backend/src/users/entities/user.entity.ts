/**
 * USER ENTITY
 * 
 * User interface matching the Prisma schema for the todo application.
 * This represents the user model for authentication and todo ownership.
 */

import { Exclude } from 'class-transformer';
import { Todo } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  todos?: Todo[];
}

export class UserEntity implements User {
  id: string;
  email: string;
  name: string;

  @Exclude()
  password: string;

  createdAt: Date;
  updatedAt: Date;
  todos?: Todo[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  // Helper method to get display name
  get displayName(): string {
    return this.name;
  }
}