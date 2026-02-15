import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-700');
  });

  it.each([
    ['primary', 'bg-blue-100', 'text-blue-700'],
    ['success', 'bg-green-100', 'text-green-700'],
    ['warning', 'bg-amber-100', 'text-amber-700'],
    ['danger', 'bg-red-100', 'text-red-700'],
    ['purple', 'bg-purple-100', 'text-purple-700'],
  ] as const)('applies %s variant correctly', (variant, bgClass, textClass) => {
    render(<Badge variant={variant}>Test</Badge>);
    const badge = screen.getByText('Test');
    expect(badge).toHaveClass(bgClass, textClass);
  });

  it('applies additional className', () => {
    render(<Badge className="ml-2">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('ml-2');
  });
});
