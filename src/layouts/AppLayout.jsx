import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';
import SubMenuBar from './SubMenuBar';
import { toggleMobileNav, toggleSidebar } from '../store/slices/appSlice';
import { matchRoute } from '../navigation/routeConfig';
import { useRecentPages } from '../features/productivity/hooks/useRecentPages';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';
import ErrorBoundary from '../components/common/ErrorBoundary';

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 64;

export default function AppLayout() {
  const dispatch = useDispatch();
  const { sidebarCollapsed, mobileNavOpen } = useSelector((s) => s.app);
  const location = useLocation();
  const meta = matchRoute(location.pathname);
  useRecentPages();

  const onToggleSidebar = () => dispatch(toggleSidebar());
  const onToggleMobile = () => dispatch(toggleMobileNav());

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={onToggleSidebar}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => dispatch({ type: 'app/setMobileNavOpen', payload: false })}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          ml: { md: `${sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED}px` },
          transition: 'margin-left 200ms ease',
        }}
      >
        {/* 1. HEADER (context selectors, search, notifications) */}
        <Header
          onToggleMobile={onToggleMobile}
          // breadcrumb={meta?.breadcrumb}
          // title={meta?.title}
        />

        {/* 2. SUB MENU BAR (horizontal tabs for active group) */}
        <SubMenuBar pathname={location.pathname} />

        {/* 3. PAGE CONTENT */}
        <Box className="p-4 md:p-6 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <ErrorBoundary key={location.pathname}>
                <Outlet />
              </ErrorBoundary>
            </PageTransition>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}