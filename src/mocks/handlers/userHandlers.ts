import { http, HttpResponse } from 'msw';
import { generateId, delay } from './utils';
import type { User } from './user.types';

/**
 * In-memory database for users
 */
let users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'user',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
];

/**
 * Mock API handlers for Users CRUD operations
 */
export const userHandlers = [
  /**
   * GET /api/users
   * List all users with optional filtering and pagination
   */
  http.get('/api/users', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const role = url.searchParams.get('role');
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;

    let filteredUsers = [...users];

    // Apply search filter
    if (search) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply role filter
    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json({
      data: paginatedUsers,
      meta: {
        total: filteredUsers.length,
        page,
        limit,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    });
  }),

  /**
   * GET /api/users/:id
   * Get a single user by ID
   */
  http.get('/api/users/:id', async ({ params }) => {
    await delay(200);

    const { id } = params;
    const user = users.find((u) => u.id === id);

    if (!user) {
      return HttpResponse.json(
        {
          message: `User with id ${id} not found`,
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(user);
  }),

  /**
   * POST /api/users
   * Create a new user
   */
  http.post('/api/users', async ({ request }) => {
    await delay(400);

    const body = (await request.json()) as Partial<User>;

    // Validation
    if (!body.name || !body.email) {
      return HttpResponse.json(
        {
          message: 'Name and email are required',
          error: 'Validation Error',
        },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingUser = users.find((u) => u.email === body.email);
    if (existingUser) {
      return HttpResponse.json(
        {
          message: 'A user with this email already exists',
          error: 'Conflict',
        },
        { status: 409 }
      );
    }

    const newUser: User = {
      id: generateId(),
      name: body.name,
      email: body.email,
      role: body.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);

    return HttpResponse.json(newUser, { status: 201 });
  }),

  /**
   * PUT /api/users/:id
   * Replace a user (full update)
   */
  http.put('/api/users/:id', async ({ params, request }) => {
    await delay(400);

    const { id } = params;
    const body = (await request.json()) as Partial<User>;

    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return HttpResponse.json(
        {
          message: `User with id ${id} not found`,
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    // Validation
    if (!body.name || !body.email) {
      return HttpResponse.json(
        {
          message: 'Name and email are required',
          error: 'Validation Error',
        },
        { status: 400 }
      );
    }

    // Check for duplicate email (excluding current user)
    const existingUser = users.find(
      (u) => u.email === body.email && u.id !== id
    );
    if (existingUser) {
      return HttpResponse.json(
        {
          message: 'A user with this email already exists',
          error: 'Conflict',
        },
        { status: 409 }
      );
    }

    const updatedUser: User = {
      ...users[userIndex],
      name: body.name,
      email: body.email,
      role: body.role || users[userIndex].role,
      updatedAt: new Date().toISOString(),
    };

    users[userIndex] = updatedUser;

    return HttpResponse.json(updatedUser);
  }),

  /**
   * PATCH /api/users/:id
   * Update a user (partial update)
   */
  http.patch('/api/users/:id', async ({ params, request }) => {
    await delay(400);

    const { id } = params;
    const body = (await request.json()) as Partial<User>;

    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return HttpResponse.json(
        {
          message: `User with id ${id} not found`,
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    // Check for duplicate email if email is being updated
    if (body.email) {
      const existingUser = users.find(
        (u) => u.email === body.email && u.id !== id
      );
      if (existingUser) {
        return HttpResponse.json(
          {
            message: 'A user with this email already exists',
            error: 'Conflict',
          },
          { status: 409 }
        );
      }
    }

    const updatedUser: User = {
      ...users[userIndex],
      ...body,
      id: users[userIndex].id, // Preserve ID
      createdAt: users[userIndex].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    users[userIndex] = updatedUser;

    return HttpResponse.json(updatedUser);
  }),

  /**
   * DELETE /api/users/:id
   * Delete a user
   */
  http.delete('/api/users/:id', async ({ params }) => {
    await delay(300);

    const { id } = params;
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return HttpResponse.json(
        {
          message: `User with id ${id} not found`,
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    users.splice(userIndex, 1);

    return HttpResponse.json(
      {
        message: 'User deleted successfully',
      },
      { status: 200 }
    );
  }),

  /**
   * DELETE /api/users
   * Bulk delete users
   */
  http.delete('/api/users', async ({ request }) => {
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
    users = users.filter((u) => !body.ids.includes(u.id));

    return HttpResponse.json({
      message: `${deletedCount} users deleted successfully`,
      deletedCount,
    });
  }),
];
