// ============================================
// BooQoo Type Definitions - Main Export
// ============================================

export * from './user';
export * from './store';
export * from './product';
export * from './inventory';
export * from './transaction';
export * from './api';
export * from './sync';

// Common utility types
export type ID = string;

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
