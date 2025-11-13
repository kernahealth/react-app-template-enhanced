import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ErrorBoundary,
  AppErrorBoundary,
  FormErrorBoundary,
  ComponentErrorBoundary,
} from './ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when an error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected error/i)
    ).toBeInTheDocument();
  });

  it('displays error ID', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Error ID:/i)).toBeInTheDocument();
  });

  it('shows error details when showErrorDetails is true', () => {
    render(
      <ErrorBoundary showErrorDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const detailsButton = screen.getByText(/Show technical details/i);
    expect(detailsButton).toBeInTheDocument();

    // Click to expand details
    fireEvent.click(detailsButton);

    expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
  });

  it('does not show error details when showErrorDetails is false', () => {
    render(
      <ErrorBoundary showErrorDetails={false}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.queryByText(/Show technical details/i)
    ).not.toBeInTheDocument();
  });

  it('calls onError callback when error is caught', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it('renders custom fallback UI when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('resets error state when Try Again button is clicked', () => {
    let shouldThrow = true;
    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    };

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const tryAgainButton = screen.getByText('Try Again');

    // Before clicking, set shouldThrow to false
    shouldThrow = false;
    fireEvent.click(tryAgainButton);

    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});

describe('AppErrorBoundary', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <AppErrorBoundary>
        <div>App content</div>
      </AppErrorBoundary>
    );

    expect(screen.getByText('App content')).toBeInTheDocument();
  });

  it('shows error UI when error is thrown', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});

describe('FormErrorBoundary', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <FormErrorBoundary>
        <form>Form content</form>
      </FormErrorBoundary>
    );

    expect(screen.getByText('Form content')).toBeInTheDocument();
  });

  it('shows custom form error UI when error is thrown', () => {
    render(
      <FormErrorBoundary>
        <ThrowError shouldThrow={true} />
      </FormErrorBoundary>
    );

    expect(screen.getByText('Form Error')).toBeInTheDocument();
    expect(
      screen.getByText(/There was a problem with this form/i)
    ).toBeInTheDocument();
  });
});

describe('ComponentErrorBoundary', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ComponentErrorBoundary>
        <div>Component content</div>
      </ComponentErrorBoundary>
    );

    expect(screen.getByText('Component content')).toBeInTheDocument();
  });

  it('shows custom component error UI when error is thrown', () => {
    render(
      <ComponentErrorBoundary componentName="TestComponent">
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    );

    expect(
      screen.getByText('Unable to load TestComponent')
    ).toBeInTheDocument();
  });

  it('uses default component name when not provided', () => {
    render(
      <ComponentErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    );

    expect(screen.getByText('Unable to load component')).toBeInTheDocument();
  });
});
