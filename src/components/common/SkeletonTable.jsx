import Skeleton from '@mui/material/Skeleton';

/** Renders a placeholder table — useful before data loads. */
export default function SkeletonTable({ rows = 8, cols = 6 }) {
  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-3 py-2">
                <Skeleton variant="text" width={i === 0 ? 120 : 70} height={16} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-t border-gray-100">
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-3 py-2">
                  <Skeleton variant="text" width={j === 0 ? '80%' : '60%'} height={16} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}