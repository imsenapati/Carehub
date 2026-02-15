import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No data" description="Nothing to show" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });

  it('renders action button when actionLabel and onAction provided', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="Empty"
        description="No items"
        actionLabel="Add Item"
        onAction={onAction}
      />
    );

    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('does not render action button when no actionLabel', () => {
    render(<EmptyState title="Empty" description="No items" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onAction when button clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <EmptyState
        title="Empty"
        description="No items"
        actionLabel="Click Me"
        onAction={onAction}
      />
    );

    await user.click(screen.getByText('Click Me'));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('renders icon when provided', () => {
    render(
      <EmptyState
        title="Empty"
        description="No items"
        icon={<span data-testid="test-icon">Icon</span>}
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});
