import { lazy } from 'react';

const ApprovalInbox = lazy(() => import('./pages/ApprovalInbox'));
const ApprovalRules = lazy(() => import('./pages/ApprovalRules'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

export const approvalRoutes = [
  { path: '/app/approvals', element: ApprovalInbox, title: 'Approval Inbox', breadcrumb: ['Home', 'Approvals'] },
  { path: '/app/settings/approval-rules', element: ApprovalRules, title: 'Approval Rules', breadcrumb: ['Home', 'Settings', 'Approval Rules'] },
  { path: '/app/notifications', element: NotificationsPage, title: 'Notifications', breadcrumb: ['Home', 'Notifications'] },
];