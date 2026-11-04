import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, IconButton, Menu, MenuItem, Typography, Breadcrumbs,
  Link as MuiLink, Avatar, Divider,
} from '@mui/material';
import { Menu as MenuIcon, HelpOutline, Search as SearchIcon } from '@mui/icons-material';
import { setCompany, setBranch, setFinancialYear, logout } from '../store/slices/appSlice';
import {
  selectCompanies,
  selectBranchesForCompany,
  selectCurrentCompany,
  selectCurrentBranch,
} from '../store/selectors/contextSelectors';
import GlobalSearchInput from '../features/productivity/components/GlobalSearchInput';
import FavoriteButton from '../features/productivity/components/FavoriteButton';
import NotificationMenu from '../features/approvals/components/NotificationMenu';
import { setPaletteOpen } from '../features/productivity/productivitySlice';
import { setShortcutsHelpOpen } from '../features/productivity/productivitySlice';

export default function Header({ onToggleMobile, breadcrumb = [], title }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { companyId, branchId, financialYear, user } = useSelector((s) => s.app);
  const companies = useSelector(selectCompanies);
  const branches = useSelector(selectBranchesForCompany);
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);

  const [companyAnchor, setCompanyAnchor] = useState(null);
  const [branchAnchor, setBranchAnchor] = useState(null);
  const [fyAnchor, setFyAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null); // 👈 New

  const now = new Date().getFullYear();
  const fyOptions = [
    `FY${String(now - 1).slice(2)}${String(now).slice(2)}`,
    `FY${String(now).slice(2)}${String(now + 1).slice(2)}`,
  ];

  // 👇 Logout handler
  const handleLogout = () => {
    setUserAnchor(null);
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}
    >
      <Toolbar sx={{ gap: 2, minHeight: 60 }}>
        <IconButton
          edge="start"
          onClick={onToggleMobile}
          sx={{ display: { md: 'none' } }}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </IconButton>

        {/* Context selectors */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={(e) => setCompanyAnchor(e.currentTarget)}
            className="text-left text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
          >
            <div className="text-gray-500 leading-tight text-[10px]">Company</div>
            <div className="font-medium text-gray-900 leading-tight truncate max-w-[120px] md:max-w-none">
              {company?.displayName || '—'}
            </div>
          </button>

          <button
            onClick={(e) => setBranchAnchor(e.currentTarget)}
            className="text-left text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 hidden sm:block"
          >
            <div className="text-gray-500 leading-tight text-[10px]">Branch</div>
            <div className="font-medium text-gray-900 leading-tight truncate max-w-[140px] md:max-w-none">
              {branch?.name || '—'}
            </div>
          </button>

          <button
            onClick={(e) => setFyAnchor(e.currentTarget)}
            className="text-left text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 hidden md:block"
          >
            <div className="text-gray-500 leading-tight text-[10px]">FY</div>
            <div className="font-medium text-gray-900 leading-tight">{financialYear}</div>
          </button>
        </Box>

        <Box sx={{ flex: 1 }} />

        <div className="hidden md:block mr-2">
          <GlobalSearchInput />
        </div>

        <IconButton
          size="small"
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          aria-label="Search"
          onClick={() => dispatch(setPaletteOpen(true))}
        >
          <SearchIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          aria-label="Help"
          onClick={() => dispatch(setShortcutsHelpOpen(true))}
        >
          <HelpOutline fontSize="small" />
        </IconButton>

        <FavoriteButton />
        <NotificationMenu />

        {/* 👇 Avatar with dropdown */}
        <IconButton
          size="small"
          onClick={(e) => setUserAnchor(e.currentTarget)}
          aria-label="User menu"
          sx={{ p: 0 }}
        >
          <Avatar
            sx={{ width: 30, height: 30, bgcolor: user?.avatarColor || '#2563eb', fontSize: 13, cursor: 'pointer' }}
          >
            {user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('') || 'U'}
          </Avatar>
        </IconButton>
      </Toolbar>

      {/* Breadcrumb row */}
      {breadcrumb.length > 0 && (
        <Box sx={{ px: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
              {title}
            </Typography>
            <Breadcrumbs sx={{ fontSize: 12 }}>
              {breadcrumb.map((b, i) => (
                <MuiLink
                  key={i}
                  underline="hover"
                  color={i === breadcrumb.length - 1 ? 'text.primary' : 'text.secondary'}
                  sx={{ fontSize: 12 }}
                >
                  {b}
                </MuiLink>
              ))}
            </Breadcrumbs>
          </div>
        </Box>
      )}

      {/* Company menu */}
      <Menu
        anchorEl={companyAnchor}
        open={!!companyAnchor}
        onClose={() => setCompanyAnchor(null)}
      >
        {companies.map((c) => (
          <MenuItem
            key={c.id}
            selected={c.id === companyId}
            onClick={() => {
              dispatch(setCompany(c.id));
              setCompanyAnchor(null);
            }}
          >
            {c.displayName}
          </MenuItem>
        ))}
      </Menu>

      {/* Branch menu */}
      <Menu
        anchorEl={branchAnchor}
        open={!!branchAnchor}
        onClose={() => setBranchAnchor(null)}
      >
        {branches.map((b) => (
          <MenuItem
            key={b.id}
            selected={b.id === branchId}
            onClick={() => {
              dispatch(setBranch(b.id));
              setBranchAnchor(null);
            }}
          >
            {b.name}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem disabled>All branches (coming soon)</MenuItem>
      </Menu>

      {/* FY menu */}
      <Menu anchorEl={fyAnchor} open={!!fyAnchor} onClose={() => setFyAnchor(null)}>
        {fyOptions.map((fy) => (
          <MenuItem
            key={fy}
            selected={fy === financialYear}
            onClick={() => {
              dispatch(setFinancialYear(fy));
              setFyAnchor(null);
            }}
          >
            {fy}
          </MenuItem>
        ))}
      </Menu>

      {/* 👇 User menu with Logout */}
      <Menu
        anchorEl={userAnchor}
        open={!!userAnchor}
        onClose={() => setUserAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 180 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
            {user?.name || 'User'}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            {user?.email || ''}
          </Typography>
          {user?.role && (
            <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 0.5, textTransform: 'capitalize' }}>
              Role: {user.role}
            </Typography>
          )}
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontSize: 14 }}>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
}