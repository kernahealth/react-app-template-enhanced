import { userService } from '../services/userService';
import type {
  User,
  CreateUserPayload,
  UsersQueryParams,
  UsersResponse,
  BulkDeleteResponse,
} from '../types/user';
import {
  useListQuery,
  useDetailQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useBaseMutation,
} from '../lib/baseQuery';

/**
 * User-related hooks for handling user management operations.
 *
 * This module provides hooks for:
 * - `useGetUsers`: Fetches user list (with optional filtering and pagination)
 * - `useGetUserById`: Fetches a single user by ID
 * - `useCreateUser`: Creates a new user
 * - `useUpdateUser`: Updates an existing user
 * - `useDeleteUser`: Deletes a single user
 * - `useBulkDeleteUsers`: Deletes multiple users at once
 *
 * These hooks work together to implement complete user management functionality
 * with automatic caching, error handling, and optimistic updates.
 */

/**
 * Hook for fetching users list with filtering and pagination.
 *
 * Retrieves user list with comprehensive filtering options including
 * search, role filtering, sorting, and pagination.
 *
 * @param queryParams - Query parameters for filtering and pagination
 * @param options - Configuration options for the query
 * @param options.enabled - Whether the query should run (default: true)
 * @param options.showErrorToast - Whether to show error toast (default: true)
 * @returns React Query object with paginated users data
 *
 * @example
 * ```tsx
 * // Get all users
 * const { data, isLoading } = useGetUsers();
 *
 * // Search users by name/email
 * const { data } = useGetUsers({ search: 'john' });
 *
 * // Filter by role
 * const { data } = useGetUsers({ role: 'admin' });
 *
 * // Paginated users
 * const { data } = useGetUsers({
 *   page: 2,
 *   limit: 10,
 *   sortBy: 'name',
 *   sortOrder: 'asc'
 * });
 * ```
 */
export const useGetUsers = (
  queryParams: UsersQueryParams = {},
  options: {
    enabled?: boolean;
    showErrorToast?: boolean;
  } = {}
) => {
  return useListQuery<UsersResponse>(
    'users',
    () => userService.getUsers(queryParams),
    queryParams, // This becomes part of the query key for proper caching
    options // useListQuery already provides sensible defaults (3min staleTime, etc.)
  );
};

/**
 * Hook for fetching a single user by ID.
 *
 * Retrieves detailed information for a specific user.
 *
 * @param userId - User ID to fetch
 * @param options - Configuration options for the query
 * @param options.enabled - Whether the query should run (default: true if userId exists)
 * @param options.showErrorToast - Whether to show error toast (default: true)
 * @returns React Query object with user data
 *
 * @example
 * ```tsx
 * // Get user by ID
 * const { data: user, isLoading } = useGetUserById('user-123');
 *
 * // Conditionally fetch user only when modal is open
 * const { data } = useGetUserById(userId, {
 *   enabled: isModalOpen && !!userId
 * });
 * ```
 */
export const useGetUserById = (
  userId: string | null,
  options: {
    enabled?: boolean;
    showErrorToast?: boolean;
  } = {}
) => {
  const enabled = options.enabled !== undefined ? options.enabled : !!userId;

  return useDetailQuery<User>(
    'users',
    userId || '',
    (id) => userService.getUserById(id),
    { ...options, enabled }
  );
};

/**
 * Hook for creating a new user.
 *
 * Creates a new user with automatic cache invalidation and toast notifications.
 *
 * @param options - Configuration options for the user creation
 * @param options.showSuccessToast - Whether to show success toast (default: true)
 * @param options.showErrorToast - Whether to show error toast (default: true)
 * @param options.onSuccess - Success callback with created user
 * @param options.onError - Error callback
 * @returns React Query mutation object for user creation
 *
 * @example
 * ```tsx
 * const createUser = useCreateUser({
 *   onSuccess: (newUser) => {
 *     console.log('Created user:', newUser.id);
 *     // Close modal, reset form, etc.
 *   }
 * });
 *
 * // Create a user
 * createUser.mutate({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   role: 'user'
 * });
 * ```
 */
export const useCreateUser = (
  options: {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    onSuccess?: (user: User) => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  return useCreateMutation<User, CreateUserPayload>(
    'users',
    (data) => userService.createUser(data),
    {
      showSuccessToast: options.showSuccessToast ?? true,
      successMessage: 'User created successfully',
      showErrorToast: options.showErrorToast ?? true,
      errorMessage: (error) => error.message,
      mutationOptions: {
        mutationKey: ['create-user'],
        onSuccess: options.onSuccess,
        onError: options.onError,
      },
    }
  );
};

/**
 * Hook for updating an existing user.
 *
 * Updates a user with automatic cache invalidation and toast notifications.
 *
 * @param options - Configuration options for the user update
 * @param options.showSuccessToast - Whether to show success toast (default: true)
 * @param options.showErrorToast - Whether to show error toast (default: true)
 * @param options.onSuccess - Success callback with updated user
 * @param options.onError - Error callback
 * @returns React Query mutation object for user update
 *
 * @example
 * ```tsx
 * const updateUser = useUpdateUser({
 *   onSuccess: (updatedUser) => {
 *     console.log('Updated user:', updatedUser.id);
 *     // Close modal, reset form, etc.
 *   }
 * });
 *
 * // Update a user
 * updateUser.mutate({
 *   userId: 'user-123',
 *   userData: {
 *     name: 'Jane Doe',
 *     email: 'jane@example.com',
 *     role: 'admin'
 *   }
 * });
 * ```
 */
export const useUpdateUser = (
  options: {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    onSuccess?: (user: User) => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  return useUpdateMutation<
    User,
    {
      userId: string;
      userData: CreateUserPayload;
    }
  >('users', (data) => userService.updateUser(data.userId, data.userData), {
    showSuccessToast: options.showSuccessToast ?? true,
    successMessage: 'User updated successfully',
    showErrorToast: options.showErrorToast ?? true,
    errorMessage: (error) => error.message,
    mutationOptions: {
      mutationKey: ['update-user'],
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  });
};

/**
 * Hook for deleting a single user.
 *
 * Deletes a user with automatic cache invalidation and toast notifications.
 *
 * @param options - Configuration options for the user deletion
 * @param options.showSuccessToast - Whether to show success toast (default: true)
 * @param options.showErrorToast - Whether to show error toast (default: true)
 * @param options.onSuccess - Success callback
 * @param options.onError - Error callback
 * @returns React Query mutation object for user deletion
 *
 * @example
 * ```tsx
 * const deleteUser = useDeleteUser({
 *   onSuccess: () => {
 *     console.log('User deleted successfully');
 *     // Refresh user list, close modal, etc.
 *   }
 * });
 *
 * // Delete a user
 * deleteUser.mutate('user-123');
 * ```
 */
export const useDeleteUser = (
  options: {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  return useDeleteMutation<string>(
    'users',
    (userId) => userService.deleteUser(userId),
    {
      showSuccessToast: options.showSuccessToast ?? true,
      successMessage: 'User deleted successfully',
      showErrorToast: options.showErrorToast ?? true,
      errorMessage: (error) => error.message,
      mutationOptions: {
        mutationKey: ['delete-user'],
        onSuccess: options.onSuccess,
        onError: options.onError,
      },
    }
  );
};

/**
 * Hook for bulk deleting multiple users.
 *
 * Provides a mutation hook to delete multiple users at once with proper
 * success/error handling and toast notifications.
 *
 * @param options - Configuration options for the mutation
 * @param options.showSuccessToast - Whether to show success toast (default: true)
 * @param options.showErrorToast - Whether to show error toast (default: true)
 * @param options.onSuccess - Success callback with bulk delete response
 * @param options.onError - Error callback
 * @returns Mutation hook for bulk deleting users
 *
 * @example
 * ```tsx
 * const { mutate: bulkDeleteUsers, isLoading } = useBulkDeleteUsers({
 *   onSuccess: (response) => {
 *     console.log(`Deleted ${response.deletedCount} users`);
 *     // Refresh user list, clear selection, etc.
 *   }
 * });
 *
 * const handleBulkDelete = () => {
 *   bulkDeleteUsers(['user-1', 'user-2', 'user-3']);
 * };
 * ```
 */
export const useBulkDeleteUsers = (
  options: {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    onSuccess?: (response: BulkDeleteResponse) => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  return useBaseMutation<BulkDeleteResponse, Error, string[]>(
    (userIds) => userService.bulkDeleteUsers(userIds),
    {
      showSuccessToast: options.showSuccessToast ?? true,
      successMessage: (response) =>
        `${response.deletedCount} user${response.deletedCount > 1 ? 's' : ''} deleted successfully`,
      showErrorToast: options.showErrorToast ?? true,
      errorMessage: (error) => error.message,
      invalidates: ['users'],
      mutationOptions: {
        mutationKey: ['bulk-delete-users'],
        onSuccess: options.onSuccess,
        onError: options.onError,
      },
    }
  );
};
