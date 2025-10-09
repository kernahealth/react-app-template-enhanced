/**
 * Order Type Definitions for Mock Handlers
 *
 * These types are used by the MSW handlers for order-related endpoints.
 * They are separate from the main application types to keep mock concerns isolated.
 */

/**
 * Order item
 */
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

/**
 * Order status
 */
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/**
 * Order entity
 */
export interface Order {
  id: string;
  userId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order creation payload
 */
export interface CreateOrderRequest {
  userId: string;
  customerName: string;
  items: OrderItem[];
  status?: OrderStatus;
}

/**
 * Order update payload (partial)
 */
export interface UpdateOrderRequest {
  userId?: string;
  customerName?: string;
  items?: OrderItem[];
  status?: OrderStatus;
}

/**
 * Order status update payload
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

/**
 * Orders list response with pagination
 */
export interface OrdersListResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
