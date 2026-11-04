
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  Tooltip,
  IconButton,
  Divider
} from '@mui/material';
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

  const closeMobile = () => {
    onMobileClose?.();
  };

  const isActive = (item) => {
    if (item.type === 'group') {
      return isGroupActive(item, pathname);
    }

    return pathname === item.path ||
      pathname.startsWith(`${item.path}/`);
  };

  const visibleMenu = menu.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  const targetPath = (item) =>
    item.type === 'group' && item.children?.length
      ? item.children[0].path
      : item.path;

  const renderContent = (isMobile = false) => {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          bgcolor: '#0f172a',
          color: '#cbd5e1',
        }}
      >
        {/* Brand */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minHeight: 64,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            EZ
          </Box>

          {!isCollapsed && (
            <Box>
              <Box sx={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
                EZY ERP
              </Box>
              <Box sx={{ fontSize: 11, color: '#94a3b8' }}>
                Enterprise Suite
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: '#1e293b' }} />

        {/* Navigation */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            py: 1,
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {visibleMenu.map((item) => {
            const active = isActive(item);
            const to = targetPath(item);
            const Icon = item.icon;

            return (
              <Box key={item.label} sx={{ px: 1, mb: 0.5 }}>
                <Tooltip
                  title={isCollapsed ? item.label : ''}
                  placement="right"
                  disableHoverListener={isMobile}
                >
                  <Box
                    component={Link}
                    to={to}
                    onClick={isMobile ? closeMobile : undefined}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1.5,
                      py: 1.2,
                      borderRadius: 1,
                      textDecoration: 'none',
                      color: active ? 'white' : '#cbd5e1',
                      bgcolor: active ? '#2563eb' : 'transparent',
                      '&:hover': {
                        bgcolor: active ? '#2563eb' : '#1e293b',
                      },
                      minHeight: 44,
                      touchAction: 'manipulation',
                    }}
                  >
                    {Icon && <Icon fontSize="small" />}

                    {!isCollapsed && (
                      <Box
                        component="span"
                        sx={{
                          fontSize: 14,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.label}
                      </Box>
                    )}
                  </Box>
                </Tooltip>
              </Box>
            );
          })}
        </Box>

        {/* Desktop collapse button only */}
        {!isMobile && (
          <>
            <Divider sx={{ borderColor: '#1e293b' }} />

            <Box
              sx={{
                p: 1,
                display: 'flex',
                justifyContent: collapsed ? 'center' : 'flex-end',
                flexShrink: 0,
              }}
            >
              <IconButton
                size="small"
                onClick={onToggle}
                sx={{ color: '#cbd5e1' }}
                aria-label="Toggle sidebar"
              >
                {collapsed
                  ? <ChevronRight fontSize="small" />
                  : <ChevronLeft fontSize="small" />}
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width,
          height: '100dvh',
          position: 'fixed',
          top: 0,
          left: 0,
          bgcolor: '#0f172a',
          transition: 'width 200ms ease',
          zIndex: 1100,
          overflow: 'hidden',
        }}
      >
        {renderContent(false)}
      </Box>

      {/* Mobile sidebar */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={Boolean(mobileOpen)}
        onClose={closeMobile}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: EXPANDED,
            maxWidth: '85vw',
            height: '100dvh',
            bgcolor: '#0f172a',
            overflow: 'hidden',
            boxSizing: 'border-box',
          },
        }}
      >
        {renderContent(true)}
      </Drawer>
    </>
  );
}
