import { useState } from 'react';
import { IconButton, Menu, MenuItem, Badge, Box, Button, Divider, Typography } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectNotifications, selectUnreadCount } from '../approvalSelectors';
import { markNotificationRead, markAllNotificationsRead } from '../approvalSlice';
import { formatDate } from '../../../lib/dayjs';

export default function NotificationMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useSelector(selectNotifications);
  const unread = useSelector(selectUnreadCount);
  const [anchor, setAnchor] = useState(null);

  const handleClick = (n) => {
    dispatch(markNotificationRead(n.id));
    setAnchor(null);
    if (n.link) navigate(n.link);
  };

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Notifications">
        <Badge badgeContent={unread} color="error" max={99}>
          <Notifications fontSize="small" />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { width: 360, maxHeight: 480 } }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 600, fontSize: 13 }}>Notifications</Typography>
          {unread > 0 && (
            <Button size="small" onClick={() => dispatch(markAllNotificationsRead())}>Mark all read</Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', fontSize: 12 }}>
            No notifications yet.
          </Box>
        )}
        {notifications.slice(0, 15).map((n) => (
          <MenuItem
            key={n.id}
            onClick={() => handleClick(n)}
            sx={{ display: 'block', py: 1, borderBottom: '1px solid #f3f4f6', opacity: n.read ? 0.6 : 1 }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: n.read ? 'transparent' : 'error.main', mt: 0.75, flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{n.title}</Typography>
                {n.body && <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{n.body}</Typography>}
                <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 0.5 }}>{formatDate(n.createdAt, 'DD MMM HH:mm')}</Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
        {notifications.length > 0 && (
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Button size="small" onClick={() => { setAnchor(null); navigate('/app/notifications'); }}>
              View all
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
}