/**
 * Common Type Definitions for Mock Handlers
 *
 * Shared types used across multiple mock handlers.
 */

/**
 * Generic pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Generic error response
 */
export interface ErrorResponse {
  message: string;
  error: string;
}

/**
 * Generic success response
 */
export interface SuccessResponse {
  message: string;
}

/**
 * Bulk delete request
 */
export interface BulkDeleteRequest {
  ids: string[];
}

/**
 * Bulk delete response
 */
export interface BulkDeleteResponse {
  message: string;
  deletedCount: number;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
}
