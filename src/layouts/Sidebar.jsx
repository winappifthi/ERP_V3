// src/layouts/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Box, Drawer, Tooltip, IconButton, Divider } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { menu, isGroupActive } from '../navigation/menuConfig';
import { useSelector } from 'react-redux';

const EXPANDED = 240;
const COLLAPSED = 64;

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) {
  const { pathname } = useLocation();
  const user = useSelector((s) => s.app.user);
  const width = collapsed ? COLLAPSED : EXPANDED;

  const isActive = (item) => {
    if (item.type === 'group') return isGroupActive(item, pathname);
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  const visibleMenu = menu.filter((item) => {
    if (!item.roles) return true; 
    return item.roles.includes(user?.role);
  });

  // For groups, link to the first child's path
  const targetPath = (item) =>
    item.type === 'group' && item.children?.length > 0 
      ? item.children[0].path 
      : item.path;

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#cbd5e1' }}>
      {/* Brand */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 64 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          EZ
        </Box>
        {!collapsed && (
          <Box>
            <Box sx={{ color: 'white', fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>EZY ERP</Box>
            <Box sx={{ fontSize: 11, color: '#94a3b8' }}>Enterprise Suite</Box>
          </Box>
        )}
      </Box>
      <Divider sx={{ borderColor: '#1e293b' }} />

      {/* Main nav (no dropdowns) */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {visibleMenu.map((item) => {
          const active = isActive(item);
          const to = targetPath(item);
          const Icon = item.icon;
          return (
            <Tooltip key={item.label} title={collapsed ? item.label : ''} placement="right">
              <Box sx={{ px: 1 }}>
                <Link
                  to={to}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm no-underline transition-colors ${
                    active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {Icon && <Icon fontSize="small" />}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Collapse toggle */}
      <Divider sx={{ borderColor: '#1e293b' }} />
      <Box sx={{ p: 1, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
        <IconButton size="small" onClick={onToggle} sx={{ color: '#cbd5e1' }} aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ display: { xs: 'none', md: 'block' }, width, height: '100vh', position: 'fixed', top: 0, left: 0, bgcolor: '#0f172a', transition: 'width 200ms ease', zIndex: 1100 }}>
        {content}
      </Box>
      <Drawer open={mobileOpen} onClose={onMobileClose} ModalProps={{ keepMounted: true }} sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: EXPANDED, bgcolor: '#0f172a' } }}>
        {content}
      </Drawer>
    </>
  );
}