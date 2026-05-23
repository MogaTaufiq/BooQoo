// ============================================
// User Types
// ============================================

import { BaseEntity } from './index';

export enum UserRole {
  OWNER = 'owner',
  CASHIER = 'cashier',
  VIEWER = 'viewer',
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  phone?: string;
  passwordHash: string;
  storeId: string;
  role: UserRole;
  lastLogin?: Date;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  storeId: string;
  storeName?: string;
  createdAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  storeName: string;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  email?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSession {
  user: UserProfile;
  tokens: AuthTokens;
}
