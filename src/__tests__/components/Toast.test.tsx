import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/ui/Toast';

function TestToastConsumer() {
  const { addToast, toasts } = useToast();
  return (
    <div>
      <button onClick={() => addToast('Test message', 'success')}>Add Success</button>
      <button onClick={() => addToast('Error msg', 'error')}>Add Error</button>
      <span data-testid="toast-count">{toasts.length}</span>
    </div>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('useToast throws when used outside ToastProvider', () => {
    vi.useRealTimers();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestToastConsumer />);
    }).toThrow('useToast must be used within ToastProvider');

    spy.mockRestore();
  });

  it('addToast displays a toast message', () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Success'));
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('toast auto-dismisses after 5 seconds', () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Success'));
    expect(screen.getByText('Test message')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5100);
    });

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('removeToast manually removes a toast', () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Success'));
    expect(screen.getByText('Test message')).toBeInTheDocument();

    const closeButton = screen.getByText('\u00D7');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('applies success type styling', () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Success'));
    const toast = screen.getByText('Test message').closest('div');
    expect(toast).toHaveClass('bg-green-600');
  });

  it('applies error type styling', () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Error'));
    const toast = screen.getByText('Error msg').closest('div');
    expect(toast).toHaveClass('bg-red-600');
  });
});
