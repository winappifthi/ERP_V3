import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, Tooltip } from '@mui/material';
import { Delete, MarkEmailRead } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import { selectNotifications, selectUnreadCount } from '../approvalSelectors';
import { markNotificationRead, markAllNotificationsRead, clearNotifications } from '../approvalSlice';
import { formatDate } from '../../../lib/dayjs';

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useSelector(selectNotifications);
  const unread = useSelector(selectUnreadCount);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${unread} unread · ${notifications.length} total`}
        actions={
          <>
            {unread > 0 && <Button size="small" startIcon={<MarkEmailRead />} onClick={() => dispatch(markAllNotificationsRead())}>Mark all read</Button>}
            {notifications.length > 0 && <Button size="small" color="error" startIcon={<Delete />} onClick={() => dispatch(clearNotifications())}>Clear all</Button>}
          </>
        }
      />
      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
        {notifications.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No notifications.</div>}
        {notifications.map((n) => (
          <div key={n.id} className={`p-3 flex gap-3 ${n.read ? 'opacity-60' : ''}`}>
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-blue-500'}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{n.title}</div>
              {n.body && <div className="text-xs text-gray-600 mt-0.5">{n.body}</div>}
              <div className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt, 'DD MMM YYYY HH:mm')}</div>
            </div>
            <div className="flex-shrink-0">
              {!n.read && (
                <Tooltip title="Mark read">
                  <IconButton size="small" onClick={() => dispatch(markNotificationRead(n.id))}>
                    <MarkEmailRead fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {n.link && (
                <Button size="small" onClick={() => { dispatch(markNotificationRead(n.id)); navigate(n.link); }}>Open</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}