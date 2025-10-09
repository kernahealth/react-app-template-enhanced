/**
 * MSW Handlers
 *
 * This module combines all mock API handlers for the application.
 * Handlers are organized by domain/resource type for better maintainability.
 */

import { userHandlers } from './userHandlers';
import { orderHandlers } from './orderHandlers';
import { miscHandlers } from './miscHandlers';

// Export individual handler groups for flexibility
export { userHandlers } from './userHandlers';
export { orderHandlers } from './orderHandlers';
export { miscHandlers } from './miscHandlers';

// Export types for use in other modules
export type { User, Order, OrderItem } from './types';

// Export utilities
export { generateId, delay } from './utils';

/**
 * Combined array of all handlers
 * This is the main export used by the MSW worker/server setup
 */
export const handlers = [...userHandlers, ...orderHandlers, ...miscHandlers];
