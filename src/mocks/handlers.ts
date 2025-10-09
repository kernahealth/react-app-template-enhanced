/**
 * MSW Handlers Entry Point
 *
 * This file re-exports handlers from the organized handlers directory.
 * The actual handler implementations are now split into separate files
 * for better organization and maintainability:
 *
 * - handlers/userHandlers.ts - User CRUD operations
 * - handlers/orderHandlers.ts - Order CRUD operations
 * - handlers/miscHandlers.ts - Utility and test endpoints
 * - handlers/utils.ts - Shared utility functions
 * - handlers/types.ts - TypeScript type definitions
 */

export {
  handlers,
  userHandlers,
  orderHandlers,
  miscHandlers,
} from './handlers/index';
export type { User, Order, OrderItem } from './handlers/index';
export { generateId, delay } from './handlers/index';
