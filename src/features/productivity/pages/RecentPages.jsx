import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { History } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import { selectRecentPages } from '../productivitySelectors';
import { clearRecentPages } from '../productivitySlice';
import { formatDate } from '../../../lib/dayjs';

export default function RecentPages() {
  const dispatch = useDispatch();
  const recent = useSelector(selectRecentPages);

  return (
    <div>
      <PageHeader
        title="Recent Pages"
        description={`${recent.length} page(s) visited this session`}
        actions={recent.length > 0 && (
          <Button size="small" variant="outlined" onClick={() => dispatch(clearRecentPages())}>Clear</Button>
        )}
      />
      {recent.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded p-8 text-center text-sm text-gray-500">
          No recent pages yet. Navigate around the app and theyll appear here.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
          {recent.map((r) => (
            <Link key={r.path + r.visitedAt} to={r.path} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
              <History fontSize="small" sx={{ color: '#6b7280' }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{r.title}</div>
                <div className="text-xs text-gray-500 font-mono truncate">{r.path}</div>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">{formatDate(r.visitedAt, 'HH:mm')}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}