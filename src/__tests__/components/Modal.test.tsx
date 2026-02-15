import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test">
        Content
      </Modal>
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders title and children when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="My Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByText('My Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        Content
      </Modal>
    );

    await user.click(screen.getByText('\u00D7'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape key pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        Content
      </Modal>
    );

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when overlay backdrop clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        Content
      </Modal>
    );

    // Click the overlay (the outermost fixed div)
    const overlay = screen.getByText('Content').closest('.fixed');
    if (overlay) {
      await user.click(overlay);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('sets document.body.style.overflow to hidden when open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test">
        Content
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('applies correct size class for sm', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Small" size="sm">
        Content
      </Modal>
    );

    const modalContent = screen.getByText('Content').closest('.bg-white');
    expect(modalContent).toHaveClass('max-w-md');
  });

  it('applies correct size class for lg', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Large" size="lg">
        Content
      </Modal>
    );

    const modalContent = screen.getByText('Content').closest('.bg-white');
    expect(modalContent).toHaveClass('max-w-2xl');
  });
});
