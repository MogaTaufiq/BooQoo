interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({ className = '', variant = 'text', width, height }: SkeletonProps) => {
  const base = 'animate-pulse bg-gray-200';
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

export const SkeletonCard = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <Skeleton className="w-1/3 mb-4" />
      <Skeleton className="w-2/3 mb-2" />
      <Skeleton className="w-full mb-2" />
      <Skeleton className="w-3/4" />
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="w-24 h-10" />
        </div>
      ))}
    </div>
  );
};
