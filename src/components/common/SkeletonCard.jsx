import Skeleton from '@mui/material/Skeleton';

/** Placeholder for summary cards. */
export default function SkeletonCard({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded p-2.5">
          <Skeleton variant="text" width="60%" height={12} />
          <Skeleton variant="text" width="40%" height={22} />
        </div>
      ))}
    </div>
  );
}