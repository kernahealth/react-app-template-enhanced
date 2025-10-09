/**
 * User type definition
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
export interface CreateUserPayload {
  name: string;
  email: string;
  role?: 'admin' | 'user';
}

/**
 * User update payload
 */
export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
}

/**
 * Query parameters for listing users
 */
export interface UsersQueryParams {
  search?: string;
  role?: 'admin' | 'user';
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | undefined; // Index signature for buildQueryParams
}

/**
 * Paginated users response
 */
export interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Bulk delete payload
 */
export interface BulkDeletePayload {
  ids: string[];
}

/**
 * Bulk delete response
 */
export interface BulkDeleteResponse {
  message: string;
  deletedCount: number;
}
