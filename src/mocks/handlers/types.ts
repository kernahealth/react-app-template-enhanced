/**
 * Mock Handlers Type Definitions
 *
 * This file re-exports all type definitions from the domain-specific type files.
 * Import from this file for convenience, or import directly from specific files
 * for better tree-shaking.
 */

// Re-export user types
export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
} from './user.types';

// Re-export order types
export type {
  Order,
  OrderItem,
  OrderStatus,
  CreateOrderRequest,
  UpdateOrderRequest,
  UpdateOrderStatusRequest,
  OrdersListResponse,
} from './order.types';

// Re-export common types
export type {
  PaginationMeta,
  PaginatedResponse,
  ErrorResponse,
  SuccessResponse,
  BulkDeleteRequest,
  BulkDeleteResponse,
  HealthCheckResponse,
} from './common.types';
