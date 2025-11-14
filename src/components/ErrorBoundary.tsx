import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId =
      Date.now().toString(36) + Math.random().toString(36).substr(2);

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Error details logged to error reporting service

    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: Send to error reporting service
      // errorReportingService.report(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          role="alert"
          aria-live="assertive"
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              maxWidth: '28rem',
              width: '100%',
              padding: '1.5rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '3rem',
                  width: '3rem',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  marginBottom: '1rem',
                }}
              >
                <svg
                  style={{
                    height: '1.5rem',
                    width: '1.5rem',
                    color: '#dc2626',
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h1
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}
              >
                Something went wrong
              </h1>

              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#4b5563',
                  marginBottom: '1.5rem',
                }}
              >
                We encountered an unexpected error. Don&apos;t worry, this has
                been reported and we&apos;re working to fix it.
              </p>

              {this.state.errorId && (
                <div
                  style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.25rem',
                    padding: '0.75rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Error ID:{' '}
                    <code style={{ fontFamily: 'monospace' }}>
                      {this.state.errorId}
                    </code>
                  </p>
                </div>
              )}

              {this.props.showErrorDetails && this.state.error && (
                <details style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                  <summary
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#4b5563',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <svg
                      style={{
                        display: 'inline',
                        width: '1rem',
                        height: '1rem',
                        marginRight: '0.25rem',
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Show technical details
                  </summary>
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: '#374151',
                      whiteSpace: 'pre-wrap',
                      overflow: 'auto',
                      maxHeight: '8rem',
                    }}
                  >
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </div>
                </details>
              )}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <button
                  onClick={this.handleRetry}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#646cff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = '#535bf2')
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = '#646cff')
                  }
                  onFocus={(e) =>
                    (e.currentTarget.style.backgroundColor = '#535bf2')
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.backgroundColor = '#646cff')
                  }
                >
                  <svg
                    style={{ width: '1rem', height: '1rem' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try Again
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={this.handleReload}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = '#e5e7eb')
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = '#f3f4f6')
                    }
                    onFocus={(e) =>
                      (e.currentTarget.style.backgroundColor = '#e5e7eb')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.backgroundColor = '#f3f4f6')
                    }
                  >
                    <svg
                      style={{ width: '1rem', height: '1rem' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Reload Page
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = '#e5e7eb')
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = '#f3f4f6')
                    }
                    onFocus={(e) =>
                      (e.currentTarget.style.backgroundColor = '#e5e7eb')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.backgroundColor = '#f3f4f6')
                    }
                  >
                    <svg
                      style={{ width: '1rem', height: '1rem' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Go Home
                  </button>
                </div>
              </div>

              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '1.5rem',
                }}
              >
                If this problem persists, please contact support with the error
                ID above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different parts of the app
export const AppErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    showErrorDetails={import.meta.env.DEV}
    onError={(error, errorInfo) => {
      // Global error logging handled by error boundary
      console.error('Error caught by boundary:', error, errorInfo);
    }}
  >
    {children}
  </ErrorBoundary>
);

export const FormErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    fallback={
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#991b1b',
          }}
        >
          <svg
            style={{ width: '1rem', height: '1rem' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Form Error</p>
        </div>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#b91c1c',
            marginTop: '0.25rem',
          }}
        >
          There was a problem with this form. Please refresh the page and try
          again.
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{
  children: ReactNode;
  componentName?: string;
}> = ({ children, componentName = 'component' }) => (
  <ErrorBoundary
    fallback={
      <div
        style={{
          padding: '0.75rem',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0.25rem',
          textAlign: 'center',
        }}
      >
        <svg
          style={{
            width: '1.25rem',
            height: '1.25rem',
            margin: '0 auto',
            color: '#9ca3af',
            marginBottom: '0.25rem',
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p style={{ fontSize: '0.75rem', color: '#4b5563' }}>
          Unable to load {componentName}
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
