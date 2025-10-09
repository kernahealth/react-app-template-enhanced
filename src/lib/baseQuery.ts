import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
  type MutationFunctionContext,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { performanceHelpers } from './queryClient';

/**
 * Configuration options for base queries
 */
interface BaseQueryConfig<TData, TError = Error> {
  // Cache configuration
  staleTime?: number;
  gcTime?: number;

  // Behavior configuration
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;

  // Error handling
  showErrorToast?: boolean;
  errorMessage?: string;

  // Performance monitoring
  enablePerformanceTracking?: boolean;

  // Custom options (will override defaults)
  queryOptions?: Partial<UseQueryOptions<TData, TError>>;
}

/**
 * Configuration options for base mutations
 */
interface BaseMutationConfig<TData, TError = Error, TVariables = void> {
  // Success handling
  showSuccessToast?: boolean;
  successMessage?: string | ((data: TData) => string);

  // Error handling
  showErrorToast?: boolean;
  errorMessage?: string | ((error: TError) => string);

  // Cache invalidation
  invalidates?: Array<QueryKey | string>;
  invalidatesAll?: boolean;

  // Optimistic updates
  optimisticUpdate?: {
    queryKey: QueryKey;
    updater: (old: unknown, variables: TVariables) => unknown;
  };

  // Performance monitoring
  enablePerformanceTracking?: boolean;

  // Custom options (will override defaults)
  mutationOptions?: Partial<UseMutationOptions<TData, TError, TVariables>>;
}

/**
 * Base query hook factory with standardized configuration
 */
export function useBaseQuery<TData = unknown, TError = Error>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  config: BaseQueryConfig<TData, TError> = {}
) {
  const {
    staleTime = 1000 * 60 * 5, // 5 minutes
    gcTime = 1000 * 60 * 30, // 30 minutes
    enabled = true,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    showErrorToast = true,
    errorMessage,
    enablePerformanceTracking = true,
    queryOptions = {},
  } = config;

  const result = useQuery<TData, TError>({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey,
    queryFn: enablePerformanceTracking
      ? () => performanceHelpers.measureQuery(queryKey, queryFn)
      : queryFn,
    staleTime,
    gcTime,
    enabled,
    refetchOnMount,
    refetchOnWindowFocus,
    ...queryOptions,
  });

  // Handle errors manually since onError is deprecated
  if (result.error && showErrorToast) {
    const getErrorMessage = (error: TError): string => {
      if (error instanceof Error) {
        return error.message;
      }
      if (typeof error === 'string') {
        return error;
      }
      if (error && typeof error === 'object' && 'message' in error) {
        return String((error as { message: unknown }).message);
      }
      return 'An error occurred';
    };

    const message = errorMessage || getErrorMessage(result.error);

    // Only show toast once per error
    if (result.isError && result.failureCount === 1) {
      toast.error(message);
    }
  }

  return result;
}

/**
 * Base mutation hook factory with standardized configuration
 */
export function useBaseMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: BaseMutationConfig<TData, TError, TVariables> = {}
) {
  const queryClient = useQueryClient();

  const {
    showSuccessToast = false,
    successMessage,
    showErrorToast = true,
    errorMessage,
    invalidates = [],
    invalidatesAll = false,
    optimisticUpdate,
    enablePerformanceTracking = true,
    mutationOptions = {},
  } = config;

  const baseOnSuccess = (
    data: TData,
    variables: TVariables,
    onMutateResult: unknown,
    context: MutationFunctionContext
  ) => {
    // Show success toast if configured
    if (showSuccessToast) {
      const message =
        typeof successMessage === 'function'
          ? successMessage(data)
          : successMessage || 'Operation completed successfully';
      toast.success(message);
    }

    // Handle cache invalidation
    if (invalidatesAll) {
      queryClient.invalidateQueries();
    } else if (invalidates.length > 0) {
      invalidates.forEach((key) => {
        const queryKey = typeof key === 'string' ? [key] : key;
        queryClient.invalidateQueries({ queryKey });
      });
    }

    // Call custom onSuccess if provided
    mutationOptions.onSuccess?.(data, variables, onMutateResult, context);
  };

  const baseOnError = (
    error: TError,
    variables: TVariables,
    onMutateResult: unknown,
    context: MutationFunctionContext
  ) => {
    // Show error toast if configured
    if (showErrorToast) {
      const message =
        typeof errorMessage === 'function'
          ? errorMessage(error)
          : errorMessage || (error as Error).message || 'Operation failed';
      toast.error(message);
    }

    // Revert optimistic update on error
    if (
      optimisticUpdate &&
      onMutateResult &&
      typeof onMutateResult === 'object' &&
      'previousData' in onMutateResult
    ) {
      const { previousData } = onMutateResult as { previousData: unknown };
      queryClient.setQueryData(optimisticUpdate.queryKey, previousData);
    }

    // Call custom onError if provided
    mutationOptions.onError?.(error, variables, onMutateResult, context);
  };

  const baseOnSettled = (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    onMutateResult: unknown,
    context: MutationFunctionContext
  ) => {
    // Refetch queries after mutation settles (success or error)
    if (optimisticUpdate) {
      queryClient.invalidateQueries({ queryKey: optimisticUpdate.queryKey });
    }

    // Call custom onSettled if provided
    mutationOptions.onSettled?.(
      data,
      error,
      variables,
      onMutateResult,
      context
    );
  };

  return useMutation<TData, TError, TVariables>({
    mutationFn: enablePerformanceTracking
      ? (variables: TVariables) =>
          performanceHelpers.measureMutation('mutation', mutationFn, variables)
      : mutationFn,
    onMutate: async (variables: TVariables) => {
      // Apply optimistic update if configured
      if (optimisticUpdate) {
        await queryClient.cancelQueries({
          queryKey: optimisticUpdate.queryKey,
        });
        const previousData = queryClient.getQueryData(
          optimisticUpdate.queryKey
        );
        queryClient.setQueryData(optimisticUpdate.queryKey, (old: unknown) =>
          optimisticUpdate.updater(old, variables)
        );
        return { previousData };
      }

      // Call custom onMutate if provided, with proper context
      if (mutationOptions.onMutate) {
        return mutationOptions.onMutate(variables, {
          client: queryClient,
          meta: {},
        });
      }

      return undefined;
    },
    onSuccess: baseOnSuccess,
    onError: baseOnError,
    onSettled: baseOnSettled,
    // Spread other mutation options but exclude the callbacks we're handling
    ...Object.fromEntries(
      Object.entries(mutationOptions).filter(
        ([key]) =>
          !['onSuccess', 'onError', 'onSettled', 'onMutate'].includes(key)
      )
    ),
  });
}

/**
 * Specialized query hooks for common patterns
 */

/**
 * List query with pagination support
 */
export function useListQuery<
  TData = unknown,
  TParams = Record<string, unknown>,
>(
  domain: string,
  queryFn: (params?: TParams) => Promise<TData>,
  params?: TParams,
  config: BaseQueryConfig<TData> = {}
) {
  return useBaseQuery([domain, 'list', params], () => queryFn(params), {
    staleTime: 1000 * 60 * 3, // 3 minutes for lists
    ...config,
  });
}

/**
 * Detail query for single entities
 */
export function useDetailQuery<TData = unknown>(
  domain: string,
  id: string,
  queryFn: (id: string) => Promise<TData>,
  config: BaseQueryConfig<TData> = {}
) {
  return useBaseQuery([domain, 'detail', id], () => queryFn(id), {
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes for details
    ...config,
  });
}

/**
 * Search query with debouncing
 */
export function useSearchQuery<TData = unknown>(
  domain: string,
  query: string,
  queryFn: (query: string) => Promise<TData>,
  config: BaseQueryConfig<TData> = {}
) {
  return useBaseQuery([domain, 'search', query], () => queryFn(query), {
    enabled: query.length >= 2,
    staleTime: 1000 * 30, // 30 seconds for search
    ...config,
  });
}

/**
 * Analytics query with longer cache times
 */
export function useAnalyticsQuery<
  TData = unknown,
  TParams = Record<string, unknown>,
>(
  domain: string,
  params: TParams,
  queryFn: (params: TParams) => Promise<TData>,
  config: BaseQueryConfig<TData> = {}
) {
  return useBaseQuery([domain, 'analytics', params], () => queryFn(params), {
    staleTime: 1000 * 60 * 15, // 15 minutes for analytics
    gcTime: 1000 * 60 * 60, // 1 hour
    ...config,
  });
}

/**
 * CRUD mutation factories
 */
export function useCreateMutation<TData = unknown, TVariables = unknown>(
  domain: string,
  mutationFn: (data: TVariables) => Promise<TData>,
  config: BaseMutationConfig<TData, Error, TVariables> = {}
) {
  return useBaseMutation(mutationFn, {
    showSuccessToast: true,
    successMessage: `${domain} created successfully`,
    invalidates: [domain],
    ...config,
  });
}

export function useUpdateMutation<
  TData = unknown,
  TVariables = { id: string; data: unknown },
>(
  domain: string,
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: BaseMutationConfig<TData, Error, TVariables> = {}
) {
  return useBaseMutation(mutationFn, {
    showSuccessToast: true,
    successMessage: `${domain} updated successfully`,
    invalidates: [domain],
    ...config,
  });
}

export function useDeleteMutation<TVariables = string>(
  domain: string,
  mutationFn: (id: TVariables) => Promise<void>,
  config: BaseMutationConfig<void, Error, TVariables> = {}
) {
  return useBaseMutation(mutationFn, {
    showSuccessToast: true,
    successMessage: `${domain} deleted successfully`,
    invalidates: [domain],
    ...config,
  });
}
