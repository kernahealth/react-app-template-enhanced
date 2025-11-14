import { http, HttpResponse } from 'msw';
import { generateId, delay } from './utils';
import type { Order } from './order.types';

/**
 * In-memory database for orders
 */
let orders: Order[] = [
  {
    id: 'order-1',
    userId: '1',
    customerName: 'John Doe',
    items: [
      {
        productId: 'prod-1',
        productName: 'Laptop',
        quantity: 1,
        price: 999.99,
      },
      {
        productId: 'prod-2',
        productName: 'Mouse',
        quantity: 2,
        price: 29.99,
      },
    ],
    total: 1059.97,
    status: 'delivered',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-20T15:45:00.000Z',
  },
  {
    id: 'order-2',
    userId: '2',
    customerName: 'Jane Smith',
    items: [
      {
        productId: 'prod-3',
        productName: 'Keyboard',
        quantity: 1,
        price: 79.99,
      },
    ],
    total: 79.99,
    status: 'processing',
    createdAt: '2024-01-18T14:20:00.000Z',
    updatedAt: '2024-01-18T14:20:00.000Z',
  },
  {
    id: 'order-3',
    userId: '3',
    customerName: 'Bob Johnson',
    items: [
      {
        productId: 'prod-4',
        productName: 'Monitor',
        quantity: 2,
        price: 249.99,
      },
      {
        productId: 'prod-5',
        productName: 'USB Cable',
        quantity: 3,
        price: 9.99,
      },
    ],
    total: 529.95,
    status: 'shipped',
    createdAt: '2024-01-20T09:15:00.000Z',
    updatedAt: '2024-01-21T11:30:00.000Z',
  },
  {
    id: 'order-4',
    userId: '1',
    customerName: 'John Doe',
    items: [
      {
        productId: 'prod-6',
        productName: 'Headphones',
        quantity: 1,
        price: 149.99,
      },
    ],
    total: 149.99,
    status: 'pending',
    createdAt: '2024-01-22T16:00:00.000Z',
    updatedAt: '2024-01-22T16:00:00.000Z',
  },
];

/**
 * Mock API handlers for Orders CRUD operations
 */
export const orderHandlers = [
  /**
   * GET /api/orders
   * List all orders with optional filtering and pagination
   */
  http.get('*/api/orders', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const userId = url.searchParams.get('userId');
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;

    let filteredOrders = [...orders];

    // Apply search filter (search by customer name or order id)
    if (search) {
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.customerName.toLowerCase().includes(search.toLowerCase()) ||
          order.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (status) {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === status
      );
    }

    // Apply userId filter
    if (userId) {
      filteredOrders = filteredOrders.filter(
        (order) => order.userId === userId
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return HttpResponse.json({
      data: paginatedOrders,
      meta: {
        total: filteredOrders.length,
        page,
        limit,
        totalPages: Math.ceil(filteredOrders.length / limit),
      },
    });
  }),

  /**
   * GET /api/orders/:id
   * Get a single order by ID
   */
  http.get('*/api/orders/:id', async ({ params }) => {
    await delay(200);

    const { id } = params;
    const order = orders.find((o) => o.id === id);

    if (!order) {
      return HttpResponse.json(
        {
          message: `Order with id ${id} not found`,
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(order);
  }),

  /**
   * POST /api/orders
   * Create a new order
   */
  http.post('*/api/orders', async ({ request }) => {
    await delay(400);

    const body = (await request.json()) as Partial<Order>;

    // Validation
    if (
      !body.userId ||
      !body.customerName ||
      !body.items ||
      body.items.length === 0
    ) {
      return HttpResponse.json(
        {
          message: 'userId, customerName, and items are required',
          error: 'Validation Error',
        },
        { status: 400 }
      );
    }

    // Calculate total from items
    const total = body.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder: Order = {
      id: `order-${generateId()}`,
      userId: body.userId,
      customerName: body.customerName,
      items: body.items,
      total,
      status: body.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);

    return HttpResponse.json(newOrder, { status: 201 });
  }),

  /**
   * PUT /api/orders/:id
   * Replace an order (full update)
   */
  http.put('*/api/orders/:id', async ({ params, request }) => {
    await delay(400);

    const { id } = params;
    const body = (await request.json()) as Partial<Order>;

    const orderIndex = orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return HttpResponse.json(
        {
          message: `Order with id ${id} not found`,
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    // Validation
    if (
      !body.userId ||
      !body.customerName ||
      !body.items ||
      body.items.length === 0
    ) {
      return HttpResponse.json(
        {
          message: 'userId, customerName, and items are required',
          error: 'Validation Error',
        },
        { status: 400 }
      );
    }

    // Recalculate total from items
    const total = body.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const updatedOrder: Order = {
      ...orders[orderIndex],
      userId: body.userId,
      customerName: body.customerName,
      items: body.items,
      total,
      status: body.status || orders[orderIndex].status,
      updatedAt: new Date().toISOString(),
    };

    orders[orderIndex] = updatedOrder;

    return HttpResponse.json(updatedOrder);
  }),

  /**
   * PATCH /api/orders/:id
   * Update an order (partial update)
   */
  http.patch('*/api/orders/:id', async ({ params, request }) => {
    await delay(400);

    const { id } = params;
    const body = (await request.json()) as Partial<Order>;

    const orderIndex = orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return HttpResponse.json(
        {
          message: `Order with id ${id} not found`,
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    // Recalculate total if items were updated
    let total = orders[orderIndex].total;
    if (body.items) {
      total = body.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    }

    const updatedOrder: Order = {
      ...orders[orderIndex],
      ...body,
      total: body.items ? total : orders[orderIndex].total,
      id: orders[orderIndex].id, // Preserve ID
      createdAt: orders[orderIndex].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    orders[orderIndex] = updatedOrder;

    return HttpResponse.json(updatedOrder);
  }),

  /**
   * DELETE /api/orders/:id
   * Delete an order
   */
  http.delete('*/api/orders/:id', async ({ params }) => {
    await delay(300);

    const { id } = params;
    const orderIndex = orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return HttpResponse.json(
        {
          message: `Order with id ${id} not found`,
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    orders.splice(orderIndex, 1);

    return HttpResponse.json(
      {
        message: 'Order deleted successfully',
      },
      { status: 200 }
    );
  }),

  /**
   * DELETE /api/orders
   * Bulk delete orders
   */
  http.delete('*/api/orders', async ({ request }) => {
    await delay(400);

    const body = (await request.json()) as { ids: string[] };

    if (!body.ids || !Array.isArray(body.ids)) {
      return HttpResponse.json(
        {
          message: 'ids array is required',
          error: 'Validation Error',
        },
        { status: 400 }
      );
    }

    const deletedCount = body.ids.length;
    orders = orders.filter((o) => !body.ids.includes(o.id));

    return HttpResponse.json({
      message: `${deletedCount} orders deleted successfully`,
      deletedCount,
    });
  }),

  /**
   * PATCH /api/orders/:id/status
   * Update order status (convenience endpoint)
   */
  http.patch('*/api/orders/:id/status', async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const body = (await request.json()) as { status: Order['status'] };

    const orderIndex = orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return HttpResponse.json(
        {
          message: `Order with id ${id} not found`,
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    if (!body.status) {
      return HttpResponse.json(
        {
          message: 'status is required',
          error: 'Validation Error',
        },
        { status: 400 }
      );
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      status: body.status,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(orders[orderIndex]);
  }),
];
