import { http, HttpResponse } from 'msw';

/**
 * Miscellaneous API handlers for testing and utilities
 */
export const miscHandlers = [
  /**
   * GET /api/error
   * Example error endpoint for testing error handling
   */
  http.get('/api/error', () => {
    return HttpResponse.json(
      {
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
      { status: 500 }
    );
  }),

  /**
   * GET /api/health
   * Health check endpoint
   */
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }),
];
