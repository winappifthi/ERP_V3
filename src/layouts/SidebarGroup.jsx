import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Box, Collapse, Tooltip } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

export default function SidebarGroup({ group, collapsed }) {
  const location = useLocation();
  const isActiveChild = group.children.some((c) => location.pathname.startsWith(c.path));
  const [open, setOpen] = useState(isActiveChild);

  useEffect(() => {
    if (isActiveChild) setOpen(true);
  }, [isActiveChild]);

  return (
    <Box sx={{ px: 1, mb: 0.5 }}>
      <Tooltip title={collapsed ? group.label : ''} placement="right">
        <Box
          role="button"
          tabIndex={0}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen((v) => !v)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 1.5, py: 1, borderRadius: 1, cursor: 'pointer',
            color: isActiveChild ? 'white' : '#cbd5e1',
            '&:hover': { bgcolor: '#1e293b' },
          }}
        >
          <group.icon fontSize="small" />
          {!collapsed && (
            <>
              <span className="flex-1 text-sm truncate">{group.label}</span>
              {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </>
          )}
        </Box>
      </Tooltip>

      {!collapsed && (
        <Collapse in={open}>
          <Box sx={{ pl: 4, pt: 0.5 }}>
            {group.children.map((c) => (
              <NavLink
                key={c.path}
                to={c.path}
                className={({ isActive }) =>
                  `block px-3 py-1.5 rounded text-sm no-underline transition-colors ${
                    isActive ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                {c.label}
              </NavLink>
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}