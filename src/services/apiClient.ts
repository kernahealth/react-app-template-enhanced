import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from 'axios';

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl?: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl || process.env.VITE_API_BASE_URL || '',
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for error handling
   */
  private setupInterceptors(): void {
    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make an API request
   */
  async request<T = unknown>(
    endpoint: string,
    config: AxiosRequestConfig & RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request({
        url: endpoint,
        ...config,
      });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', data });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', data });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', data });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Upload file with multipart/form-data
   */
  async upload<T = unknown>(
    endpoint: string,
    formData: FormData,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      data: formData,
      headers: {
        ...config.headers,
        // Don't set Content-Type, let axios handle it for FormData
      },
    });
  }

  /**
   * Handle and format errors
   */
  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      // Handle axios-specific errors
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        const message =
          errorData?.detail?.error?.message || // Backend nested error structure
          errorData?.message || // Direct message
          errorData?.error?.message || // Error object with message
          errorData?.error || // Error string
          `HTTP error! status: ${error.response.status}`;
        return new Error(message);
      } else if (error.request) {
        // Request was made but no response
        return new Error('Network error - no response received');
      } else {
        // Something else happened
        return new Error(error.message || 'Request setup error');
      }
    }

    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    return new Error('An unexpected error occurred');
  }
}

// Create default API client instance
export const apiClient = new ApiClient();

// Export types for use in other parts of the application
export type { ApiResponse, RequestConfig };
