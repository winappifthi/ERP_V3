// src/layouts/SubMenuBar.jsx
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import { findActiveGroup } from '../navigation/menuConfig';

export default function SubMenuBar({ pathname }) {
  const group = findActiveGroup(pathname);

  if (!group || !Array.isArray(group.children) || group.children.length === 0) {
    return null;
  }

  const normalized =
    pathname && pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  return (
    <Box
      sx={{
        px: 3,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.default',
        overflowX: 'auto',
        height: 45,
      }}
    >
      <Box sx={{ display: 'flex', minWidth: 'max-content' }}>
        {group.children.map((child) => {
          const active =
            normalized === child.path ||
            normalized.startsWith(`${child.path}/`);

          return (
            <Link
              key={child.path}
              to={child.path}
              className={`block px-4 py-2.5 text-sm font-medium no-underline whitespace-nowrap border-b-2 -mb-px transition-colors ${
                active
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {child.label}
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}