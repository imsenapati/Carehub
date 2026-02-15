import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Suppress console.error from ErrorBoundary during tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error message');
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders default fallback when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });

  it('calls onError callback', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError.mock.calls[0][0].message).toBe('Test error message');
  });

  it('recovers when Try again is clicked', async () => {
    const user = userEvent.setup();

    // We need a way to control whether the component throws
    let shouldThrow = true;

    function ControlledThrower() {
      if (shouldThrow) throw new Error('Recoverable error');
      return <div>Recovered successfully</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ControlledThrower />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Stop throwing before clicking "Try again"
    shouldThrow = false;

    await user.click(screen.getByText('Try again'));

    // After rerender, the children re-mount without error
    rerender(
      <ErrorBoundary>
        <ControlledThrower />
      </ErrorBoundary>
    );

    expect(screen.getByText('Recovered successfully')).toBeInTheDocument();
  });
});
