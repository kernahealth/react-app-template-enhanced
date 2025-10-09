import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Error handling utilities for queries and mutations
 */
const handleQueryError = (error: Error) => {
  // Don't show toast for network errors during background refetch
  if (error.message.includes('Network error')) {
    return;
  }
  // Show user-friendly error message
  toast.error(`Failed to load data: ${error.message}`);
};

const handleMutationError = () => {
  // Global error handler for monitoring/analytics
  // Add Sentry, analytics, etc. here as needed
};

const handleMutationSuccess = () => {
  // Global success handler for monitoring/analytics
  // Add success tracking, metrics, etc. here as needed
};

/**
 * Create optimized query client with global error handling
 */
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleQueryError,
    }),
    mutationCache: new MutationCache({
      onError: handleMutationError,
      onSuccess: handleMutationSuccess,
    }),
    defaultOptions: {
      queries: {
        // Caching strategy
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime)

        // Network strategy
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: 'always',

        // Retry strategy
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors except 408 (timeout)
          if (error instanceof Error && 'status' in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500 && status !== 408) {
              return false;
            }
          }

          // Don't retry auth errors
          if (error.message.includes('Authentication failed')) {
            return false;
          }

          // Retry up to 3 times with exponential backoff
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Suspense and error boundaries
        throwOnError: false,
      },
      mutations: {
        // Don't retry mutations by default
        retry: false,
        // Global mutation settings
        throwOnError: false,
      },
    },
  });
};

/**
 * Analytics and logging utilities
 */
export const queryAnalytics = {
  logQuery: (
    queryKey: readonly unknown[],
    operation: 'start' | 'success' | 'error',
    duration?: number
  ) => {
    // Analytics logging would be implemented here in production
    // Currently disabled to avoid console warnings
    void queryKey;
    void operation;
    void duration;
  },

  logMutation: (
    mutationKey: string,
    operation: 'start' | 'success' | 'error',
    duration?: number
  ) => {
    // Analytics logging would be implemented here in production
    // Currently disabled to avoid console warnings
    void mutationKey;
    void operation;
    void duration;
  },
};

/**
 * Performance monitoring utilities
 */
export const performanceHelpers = {
  // Track query performance
  measureQuery: async <T>(
    queryKey: readonly unknown[],
    queryFn: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    queryAnalytics.logQuery(queryKey, 'start');

    try {
      const result = await queryFn();
      const duration = performance.now() - start;
      queryAnalytics.logQuery(queryKey, 'success', duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      queryAnalytics.logQuery(queryKey, 'error', duration);
      throw error;
    }
  },

  // Track mutation performance
  measureMutation: async <T, V>(
    mutationKey: string,
    mutationFn: (variables: V) => Promise<T>,
    variables: V
  ): Promise<T> => {
    const start = performance.now();
    queryAnalytics.logMutation(mutationKey, 'start');

    try {
      const result = await mutationFn(variables);
      const duration = performance.now() - start;
      queryAnalytics.logMutation(mutationKey, 'success', duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      queryAnalytics.logMutation(mutationKey, 'error', duration);
      throw error;
    }
  },
};
