import { vi, type Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, createElement } from 'react';
import { userService } from '../services/userService';
import {
  useGetUsers,
  useGetUserById,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useBulkDeleteUsers,
} from './useUsers';
import type { User, UsersResponse, BulkDeleteResponse } from '../types/user';

// Mock the userService
vi.mock('../services/userService');

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create mock user with all required fields
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Helper to create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
};

describe('useUsers hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetUsers', () => {
    it('fetches users successfully', async () => {
      const mockResponse: UsersResponse = {
        data: [
          createMockUser({
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
          }),
          createMockUser({
            id: '2',
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'admin',
          }),
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      (userService.getUsers as Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGetUsers(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(userService.getUsers).toHaveBeenCalledWith({});
    });

    it('passes query parameters to service', async () => {
      const mockResponse: UsersResponse = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };

      (userService.getUsers as Mock).mockResolvedValue(mockResponse);

      const queryParams = { search: 'john', role: 'admin' as const };

      renderHook(() => useGetUsers(queryParams), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(userService.getUsers).toHaveBeenCalledWith(queryParams);
      });
    });

    it('passes pagination parameters to service', async () => {
      const mockResponse: UsersResponse = {
        data: [
          createMockUser({ id: '11', name: 'User 11' }),
          createMockUser({ id: '12', name: 'User 12' }),
        ],
        meta: {
          total: 25,
          page: 2,
          limit: 10,
          totalPages: 3,
        },
      };

      (userService.getUsers as Mock).mockResolvedValue(mockResponse);

      const queryParams = { page: 2, limit: 10 };

      renderHook(() => useGetUsers(queryParams), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(userService.getUsers).toHaveBeenCalledWith(queryParams);
      });
    });

    it('handles errors', async () => {
      const error = new Error('Failed to fetch users');
      (userService.getUsers as Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useGetUsers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useGetUserById', () => {
    it('fetches a single user successfully', async () => {
      const mockUser = createMockUser();

      (userService.getUserById as Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useGetUserById('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUser);
      expect(userService.getUserById).toHaveBeenCalledWith('1');
    });

    it('does not fetch when userId is null', () => {
      const { result } = renderHook(() => useGetUserById(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(userService.getUserById).not.toHaveBeenCalled();
    });

    it('respects enabled option', () => {
      const { result } = renderHook(
        () => useGetUserById('1', { enabled: false }),
        {
          wrapper: createWrapper(),
        }
      );

      expect(result.current.isLoading).toBe(false);
      expect(userService.getUserById).not.toHaveBeenCalled();
    });
  });

  describe('useCreateUser', () => {
    it('creates a user successfully', async () => {
      const newUser = createMockUser({
        id: '3',
        name: 'New User',
        email: 'new@example.com',
      });

      (userService.createUser as Mock).mockResolvedValue(newUser);

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(newUser);
      expect(userService.createUser).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      });
    });

    it('calls onSuccess callback', async () => {
      const newUser = createMockUser({
        id: '3',
        name: 'New User',
        email: 'new@example.com',
      });

      (userService.createUser as Mock).mockResolvedValue(newUser);

      const onSuccess = vi.fn();

      const { result } = renderHook(() => useCreateUser({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // TanStack Query passes additional parameters to callbacks: (data, variables, context)
      expect(onSuccess).toHaveBeenCalled();
      const callArgs = onSuccess.mock.calls[0];
      expect(callArgs[0]).toEqual(newUser); // First arg is the response data
    });

    it('handles errors', async () => {
      const error = new Error('Failed to create user');
      (userService.createUser as Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useUpdateUser', () => {
    it('updates a user successfully', async () => {
      const updatedUser = createMockUser({
        name: 'Updated User',
        email: 'updated@example.com',
        role: 'admin',
      });

      (userService.updateUser as Mock).mockResolvedValue(updatedUser);

      const { result } = renderHook(() => useUpdateUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        userId: '1',
        userData: {
          name: 'Updated User',
          email: 'updated@example.com',
          role: 'admin',
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(updatedUser);
      expect(userService.updateUser).toHaveBeenCalledWith('1', {
        name: 'Updated User',
        email: 'updated@example.com',
        role: 'admin',
      });
    });

    it('calls onSuccess callback', async () => {
      const updatedUser = createMockUser({
        name: 'Updated User',
        email: 'updated@example.com',
        role: 'admin',
      });

      (userService.updateUser as Mock).mockResolvedValue(updatedUser);

      const onSuccess = vi.fn();

      const { result } = renderHook(() => useUpdateUser({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        userId: '1',
        userData: {
          name: 'Updated User',
          email: 'updated@example.com',
          role: 'admin',
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // TanStack Query passes additional parameters to callbacks: (data, variables, context)
      expect(onSuccess).toHaveBeenCalled();
      const callArgs = onSuccess.mock.calls[0];
      expect(callArgs[0]).toEqual(updatedUser); // First arg is the response data
    });
  });

  describe('useDeleteUser', () => {
    it('deletes a user successfully', async () => {
      (userService.deleteUser as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(userService.deleteUser).toHaveBeenCalledWith('1');
    });

    it('calls onSuccess callback', async () => {
      (userService.deleteUser as Mock).mockResolvedValue(undefined);

      const onSuccess = vi.fn();

      const { result } = renderHook(() => useDeleteUser({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('calls onError callback on failure', async () => {
      const error = new Error('Failed to delete user');
      (userService.deleteUser as Mock).mockRejectedValue(error);

      const onError = vi.fn();

      const { result } = renderHook(() => useDeleteUser({ onError }), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // TanStack Query passes additional parameters to callbacks: (error, variables, context)
      expect(onError).toHaveBeenCalled();
      const callArgs = onError.mock.calls[0];
      expect(callArgs[0]).toEqual(error); // First arg is the error
    });
  });

  describe('useBulkDeleteUsers', () => {
    it('bulk deletes users successfully', async () => {
      const mockResponse: BulkDeleteResponse = {
        message: '3 users deleted successfully',
        deletedCount: 3,
      };

      (userService.bulkDeleteUsers as Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useBulkDeleteUsers(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(['1', '2', '3']);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(userService.bulkDeleteUsers).toHaveBeenCalledWith(['1', '2', '3']);
    });

    it('calls onSuccess callback with response', async () => {
      const mockResponse: BulkDeleteResponse = {
        message: '2 users deleted successfully',
        deletedCount: 2,
      };

      (userService.bulkDeleteUsers as Mock).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();

      const { result } = renderHook(() => useBulkDeleteUsers({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate(['1', '2']);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // TanStack Query passes additional parameters to callbacks: (data, variables, context)
      expect(onSuccess).toHaveBeenCalled();
      const callArgs = onSuccess.mock.calls[0];
      expect(callArgs[0]).toEqual(mockResponse); // First arg is the response data
    });

    it('handles errors during bulk delete', async () => {
      const error = new Error('Failed to bulk delete users');
      (userService.bulkDeleteUsers as Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useBulkDeleteUsers(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(['1', '2', '3']);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });
});
