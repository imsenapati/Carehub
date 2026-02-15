'use client';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({ className = '', width, height, rounded }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${rounded ? 'rounded-full' : ''} ${className}`}
      style={{ width, height }}
    />
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height={16} width={i === 0 ? '70%' : '50%'} />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 border border-[var(--color-border)]">
      <Skeleton height={14} width="40%" className="mb-3" />
      <Skeleton height={28} width="60%" className="mb-2" />
      <Skeleton height={12} width="30%" />
    </div>
  );
}
