import { useSelector } from 'react-redux';

/**
 * Renders `children` only if the current user's role is in `roles`.
 * Otherwise renders `fallback` (default: nothing).
 */
export default function RoleGuard({ roles, fallback = null, children }) {
  const user = useSelector((s) => s.app.user);
  if (!roles.includes(user.role)) return fallback;
  return children;
}