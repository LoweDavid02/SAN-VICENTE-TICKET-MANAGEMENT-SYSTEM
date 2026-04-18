export function SkeletonLine({ w = '100%', h = '14px', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: w, height: h, borderRadius: '6px' }}
    />
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="card p-5 space-y-3">
      <SkeletonLine w="40%" h="12px" />
      <SkeletonLine w="60%" h="32px" />
      {Array.from({ length: rows - 2 }).map((_, i) => (
        <SkeletonLine key={i} w={`${70 - i * 10}%`} h="12px" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 4 }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <SkeletonLine w="30%" h="16px" />
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <SkeletonLine w="24px" h="24px" className="rounded-full flex-shrink-0" />
            <SkeletonLine w={`${50 + (i % 3) * 10}%`} h="12px" />
            <SkeletonLine w="60px" h="20px" className="ml-auto flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLine w="180px" h="24px" />
          <SkeletonLine w="260px" h="14px" />
        </div>
        <SkeletonLine w="100px" h="36px" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map((i) => <SkeletonCard key={i} rows={3} />)}
      </div>
      <SkeletonTable rows={5} />
    </div>
  );
}
