import { apiClient } from './apiClient';
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UsersQueryParams,
  UsersResponse,
  BulkDeletePayload,
  BulkDeleteResponse,
} from '../types/user';

/**
 * Utility function to build URL query parameters from an object
 * @param params - Object containing query parameters
 * @returns URLSearchParams object with non-null/undefined values
 */
const buildQueryParams = (params: Record<string, unknown>): URLSearchParams => {
  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlParams.append(key, String(value));
    }
  });

  return urlParams;
};

/**
 * User Service
 * Handles all user-related API operations
 */
class UserService {
  // =============================================================================
  // READ OPERATIONS
  // =============================================================================

  /**
   * Get all users with optional filtering, sorting, and pagination
   * @param queryParams - Query parameters for filtering and pagination
   * @returns Promise<UsersResponse>
   * @example
   * // Get first page of users
   * const users = await userService.getUsers({ page: 1, limit: 10 });
   *
   * // Search users
   * const results = await userService.getUsers({ search: 'john' });
   *
   * // Filter by role
   * const admins = await userService.getUsers({ role: 'admin' });
   */
  async getUsers(queryParams: UsersQueryParams = {}): Promise<UsersResponse> {
    const params = buildQueryParams(queryParams);
    const url = `/api/users${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await apiClient.get<UsersResponse>(url);
    return response.data;
  }

  /**
   * Get a single user by ID
   * @param userId - User ID to fetch
   * @returns Promise<User>
   * @throws Error if user not found (404)
   * @example
   * const user = await userService.getUserById('123');
   */
  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/api/users/${userId}`);
    return response.data;
  }

  /**
   * Search users by name or email
   * @param searchTerm - Search term to match against name or email
   * @param options - Optional pagination parameters
   * @returns Promise<UsersResponse>
   * @example
   * const results = await userService.searchUsers('john@example.com');
   */
  async searchUsers(
    searchTerm: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<UsersResponse> {
    return this.getUsers({
      search: searchTerm,
      ...options,
    });
  }

  /**
   * Get users by role
   * @param role - User role to filter by
   * @param options - Optional pagination parameters
   * @returns Promise<UsersResponse>
   * @example
   * const admins = await userService.getUsersByRole('admin');
   */
  async getUsersByRole(
    role: 'admin' | 'user',
    options: { page?: number; limit?: number } = {}
  ): Promise<UsersResponse> {
    return this.getUsers({
      role,
      ...options,
    });
  }

  // =============================================================================
  // CREATE OPERATIONS
  // =============================================================================

  /**
   * Create a new user
   * @param userData - User data for creation
   * @returns Promise<User>
   * @throws Error if validation fails (400) or email already exists (409)
   * @example
   * const newUser = await userService.createUser({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   role: 'user'
   * });
   */
  async createUser(userData: CreateUserPayload): Promise<User> {
    // Validate required fields
    if (!userData.name || !userData.email) {
      throw new Error('Name and email are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    const response = await apiClient.post<User>('/api/users', userData);
    return response.data;
  }

  // =============================================================================
  // UPDATE OPERATIONS
  // =============================================================================

  /**
   * Update a user (full update - replaces all fields)
   * @param userId - User ID to update
   * @param userData - Complete user data
   * @returns Promise<User>
   * @throws Error if user not found (404) or validation fails (400)
   * @example
   * const updated = await userService.updateUser('123', {
   *   name: 'Jane Doe',
   *   email: 'jane@example.com',
   *   role: 'admin'
   * });
   */
  async updateUser(userId: string, userData: CreateUserPayload): Promise<User> {
    // Validate required fields for full update
    if (!userData.name || !userData.email) {
      throw new Error('Name and email are required for full update');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    const response = await apiClient.put<User>(
      `/api/users/${userId}`,
      userData
    );
    return response.data;
  }

  /**
   * Patch a user (partial update - updates only provided fields)
   * @param userId - User ID to update
   * @param userData - Partial user data to update
   * @returns Promise<User>
   * @throws Error if user not found (404) or validation fails (400)
   * @example
   * // Update only the name
   * const updated = await userService.patchUser('123', { name: 'New Name' });
   */
  async patchUser(userId: string, userData: UpdateUserPayload): Promise<User> {
    // Validate email format if provided
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
      }
    }

    const response = await apiClient.patch<User>(
      `/api/users/${userId}`,
      userData
    );
    return response.data;
  }

  /**
   * Update user role
   * @param userId - User ID to update
   * @param role - New role to assign
   * @returns Promise<User>
   * @example
   * const updated = await userService.updateUserRole('123', 'admin');
   */
  async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<User> {
    return this.patchUser(userId, { role });
  }

  // =============================================================================
  // DELETE OPERATIONS
  // =============================================================================

  /**
   * Delete a single user
   * @param userId - User ID to delete
   * @returns Promise<void>
   * @throws Error if user not found (404)
   * @example
   * await userService.deleteUser('123');
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/api/users/${userId}`);
  }

  /**
   * Bulk delete multiple users
   * @param userIds - Array of user IDs to delete
   * @returns Promise<BulkDeleteResponse>
   * @example
   * const result = await userService.bulkDeleteUsers(['123', '456', '789']);
   * console.log(`Deleted ${result.deletedCount} users`);
   */
  async bulkDeleteUsers(userIds: string[]): Promise<BulkDeleteResponse> {
    if (!userIds || userIds.length === 0) {
      throw new Error('At least one user ID is required');
    }

    const payload: BulkDeletePayload = { ids: userIds };
    const response = await apiClient.request<BulkDeleteResponse>('/api/users', {
      method: 'DELETE',
      data: payload,
    });
    return response.data;
  }

  // =============================================================================
  // UTILITY OPERATIONS
  // =============================================================================

  /**
   * Check if a user exists by ID
   * @param userId - User ID to check
   * @returns Promise<boolean>
   * @example
   * const exists = await userService.userExists('123');
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      await this.getUserById(userId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if an email is already taken
   * @param email - Email to check
   * @param excludeUserId - Optional user ID to exclude from check (for updates)
   * @returns Promise<boolean>
   * @example
   * const isTaken = await userService.isEmailTaken('john@example.com');
   */
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const response = await this.searchUsers(email, { limit: 100 });
      const users = response.data.filter((user) => user.email === email);

      if (excludeUserId) {
        return users.some((user) => user.id !== excludeUserId);
      }

      return users.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Validate user data before submission
   * @param userData - User data to validate
   * @returns Object with isValid flag and errors array
   * @example
   * const validation = userService.validateUserData({ name: '', email: 'invalid' });
   * if (!validation.isValid) {
   *   console.error(validation.errors);
   * }
   */
  validateUserData(userData: Partial<CreateUserPayload>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!userData.name || userData.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!userData.email || userData.email.trim().length === 0) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Invalid email format');
      }
    }

    if (userData.role && !['admin', 'user'].includes(userData.role)) {
      errors.push('Role must be either "admin" or "user"');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const userService = new UserService();
