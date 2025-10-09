/**
 * User Type Definitions for Mock Handlers
 *
 * These types are used by the MSW handlers for user-related endpoints.
 * They are separate from the main application types to keep mock concerns isolated.
 */

/**
 * User entity
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

/**
 * User creation payload
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  role?: 'admin' | 'user';
}

/**
 * User update payload (partial)
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
}

/**
 * Users list response with pagination
 */
export interface UsersListResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
