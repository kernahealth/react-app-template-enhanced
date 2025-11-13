# MSW Handlers

This directory contains Mock Service Worker (MSW) handlers organized by domain/resource type.

## Structure

```
handlers/
├── README.md           # This file - Documentation
├── index.ts            # Main export combining all handlers
│
├── types.ts            # Re-exports all type definitions
├── common.types.ts     # Shared/common type definitions
├── user.types.ts       # User-specific type definitions
├── order.types.ts      # Order-specific type definitions
│
├── utils.ts            # Shared utility functions
├── userHandlers.ts     # User CRUD operations handlers
├── orderHandlers.ts    # Order CRUD operations handlers
└── miscHandlers.ts     # Miscellaneous/utility handlers
```

## Type Files

The handlers use domain-specific type files for better organization and maintainability:

### Common Types (`common.types.ts`)

Shared types used across multiple handlers:

- `PaginationMeta` - Pagination metadata structure
- `PaginatedResponse<T>` - Generic paginated response wrapper
- `ErrorResponse` - Standard error response format
- `SuccessResponse` - Standard success message format
- `BulkDeleteRequest` - Bulk delete request payload
- `BulkDeleteResponse` - Bulk delete response
- `HealthCheckResponse` - Health check response format

### User Types (`user.types.ts`)

User-specific type definitions:

- `User` - User entity structure
- `CreateUserRequest` - Payload for creating users
- `UpdateUserRequest` - Payload for updating users (partial)
- `UsersListResponse` - Paginated users list response
- `BulkDeleteRequest` - User bulk delete payload
- `BulkDeleteResponse` - User bulk delete response
- `ErrorResponse` - User-specific error responses

### Order Types (`order.types.ts`)

Order-specific type definitions:

- `Order` - Order entity structure
- `OrderItem` - Individual order item structure
- `OrderStatus` - Order status type union
- `CreateOrderRequest` - Payload for creating orders
- `UpdateOrderRequest` - Payload for updating orders (partial)
- `UpdateOrderStatusRequest` - Status-only update payload
- `OrdersListResponse` - Paginated orders list response
- `BulkDeleteRequest` - Order bulk delete payload
- `BulkDeleteResponse` - Order bulk delete response
- `ErrorResponse` - Order-specific error responses

### Main Types Export (`types.ts`)

Convenience file that re-exports all types from domain-specific files. You can:

- Import from `types.ts` for convenience
- Import directly from specific type files for better tree-shaking

```typescript
// Import from main types file
import type { User, Order } from './types';

// Or import from specific type files
import type { User } from './user.types';
import type { Order } from './order.types';
```

## Available Handlers

### User Handlers (`userHandlers.ts`)

Handles all user-related API operations:

- `GET /api/users` - List users with filtering, search, and pagination
- `GET /api/users/:id` - Get single user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Full update of user
- `PATCH /api/users/:id` - Partial update of user
- `DELETE /api/users/:id` - Delete single user
- `DELETE /api/users` - Bulk delete users

**Features:**

- Email validation and uniqueness checking
- Role-based filtering (admin/user)
- Search by name or email
- Pagination support

### Order Handlers (`orderHandlers.ts`)

Handles all order-related API operations:

- `GET /api/orders` - List orders with filtering, search, and pagination
- `GET /api/orders/:id` - Get single order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Full update of order
- `PATCH /api/orders/:id` - Partial update of order
- `PATCH /api/orders/:id/status` - Update order status only
- `DELETE /api/orders/:id` - Delete single order
- `DELETE /api/orders` - Bulk delete orders

**Features:**

- Automatic total calculation from order items
- Status filtering (pending/processing/shipped/delivered/cancelled)
- Filter by userId
- Search by customer name or order ID
- Pagination support

### Miscellaneous Handlers (`miscHandlers.ts`)

Utility endpoints for testing and development:

- `GET /api/error` - Returns 500 error for testing error handling
- `GET /api/health` - Health check endpoint

## Usage

### Import All Handlers

```typescript
import { handlers } from './mocks/handlers';

// Use in MSW setup
const worker = setupWorker(...handlers);
```

### Import Specific Handler Groups

```typescript
import { userHandlers, orderHandlers } from './mocks/handlers';

// Use only specific handlers
const worker = setupWorker(...userHandlers, ...orderHandlers);
```

### Import Types

```typescript
import type { User, Order, OrderItem } from './mocks/handlers';
```

### Import Utilities

```typescript
import { generateId, delay } from './mocks/handlers';
```

## Important: URL Pattern Matching

**All handlers MUST use the wildcard `*` prefix** in their endpoint patterns:

```typescript
// ✅ CORRECT - Works with base URLs
http.get('*/api/users', async ({ request }) => { ... })

// ❌ WRONG - Won't intercept requests with base URLs
http.get('/api/users', async ({ request }) => { ... })
```

### Why?

The app uses `VITE_API_BASE_URL` from `.env` (e.g., `https://api.example.com`). When your code calls:

```typescript
apiClient.get('/api/users');
```

Axios sends the full URL: `https://api.example.com/api/users`

Without the `*` wildcard, MSW tries to match the exact path `/api/users` and fails to intercept requests with full URLs. The `*` wildcard tells MSW to match any URL ending with `/api/users`, regardless of the base URL.

## Adding New Handlers

To add a new resource type (e.g., "products"):

1. **Create types** in `types.ts`:

   ```typescript
   export interface Product {
     id: string;
     name: string;
     price: number;
     // ... other fields
   }
   ```

2. **Create handler file** `productHandlers.ts`:

   ```typescript
   import { http, HttpResponse } from 'msw';
   import { generateId, delay } from './utils';
   import type { Product } from './types';

   let products: Product[] = [
     /* mock data */
   ];

   export const productHandlers = [
     // NOTE: Always use */ prefix for compatibility with base URLs
     http.get('*/api/products', async ({ request }) => {
       // implementation
     }),
     // ... other handlers
   ];
   ```

3. **Export in** `index.ts`:

   ```typescript
   import { productHandlers } from './productHandlers';

   export { productHandlers } from './productHandlers';
   export type { Product } from './types';

   export const handlers = [
     ...userHandlers,
     ...orderHandlers,
     ...productHandlers,
     ...miscHandlers,
   ];
   ```

## Mock Data

Each handler file maintains its own in-memory data store using `let` variables:

```typescript
let users: User[] = [
  /* initial mock data */
];
let orders: Order[] = [
  /* initial mock data */
];
```

This data persists for the duration of the session and supports full CRUD operations.

## Utility Functions

### `generateId()`

Generates a random unique ID string.

```typescript
const newId = generateId(); // e.g., "k7x2n9p5q"
```

### `delay(ms?: number)`

Adds realistic API delay simulation. Default is 500ms.

```typescript
await delay(300); // Wait 300ms before responding
```

## Using Handlers

The handlers are automatically used in development mode (via `src/main.tsx`).

To test a specific endpoint:

```typescript
import { userService } from './services/userService';

// This will use the mock handlers
const users = await userService.getUsers();
```

**Note:** Unit tests (Vitest) do not currently use MSW handlers. Tests mock at the service layer using `vi.mock()`. To add MSW to unit tests or E2E tests, see:

- [MSW + Vitest Quick Start](https://mswjs.io/docs/quick-start) (complete setup example)
- [MSW + Playwright integration](https://playwright.dev/docs/mock#mock-apis)

## Response Format

All list endpoints return paginated responses:

```typescript
{
  data: Array<T>,
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

Error responses follow this format:

```typescript
{
  message: string,
  error: string
}
```

## Best Practices

1. **Keep handlers focused** - One file per resource type
2. **Validate inputs** - Return appropriate 400 errors for invalid data
3. **Use realistic delays** - Helps catch timing issues in UI
4. **Document endpoints** - Add JSDoc comments to each handler
5. **Test edge cases** - Include handlers for 404, 409, 500 errors
6. **Maintain data consistency** - Use proper HTTP status codes
7. **Follow REST conventions** - Use appropriate HTTP methods
