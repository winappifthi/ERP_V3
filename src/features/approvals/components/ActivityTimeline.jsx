import { useSelector } from 'react-redux';
import { selectDocumentActivity } from '../approvalSelectors';
import { formatDate } from '../../../lib/dayjs';

const ICONS = {
  created: '📝',
  submitted: '📤',
  approved: '✓',
  rejected: '✕',
  cancelled: '⊘',
  completed: '✓',
  posted: '✓',
};

const COLORS = {
  created: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-200 text-gray-700',
  completed: 'bg-emerald-100 text-emerald-800',
  posted: 'bg-green-100 text-green-800',
};

export default function ActivityTimeline({ documentType, documentId }) {
  const activity = useSelector(selectDocumentActivity(documentType, documentId));

  if (!activity.length) {
    return <div className="text-sm text-gray-500 py-3">No activity recorded yet.</div>;
  }

  return (
    <ol className="relative border-l-2 border-gray-200 ml-3">
      {activity.map((a) => (
        <li key={a.id} className="mb-4 ml-5">
          <span className={`absolute -left-[13px] mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${COLORS[a.action] || 'bg-gray-100 text-gray-700'}`}>
            {ICONS[a.action] || '·'}
          </span>
          <div className="flex justify-between items-start gap-2">
            <div>
              <div className="text-sm font-medium text-gray-900 capitalize">{a.action.replace('-', ' ')}</div>
              <div className="text-xs text-gray-500">
                {a.userName} · {formatDate(a.at, 'DD MMM YYYY HH:mm')}
              </div>
              {a.comment && <div className="text-xs text-gray-700 mt-1 italic">{a.comment}</div>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}