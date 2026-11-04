import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, Stack, Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login } from '../../../store/slices/appSlice';

// ─── Mock users (no Redux, no API) ─────────────────────────────────
const MOCK_USERS = [
  {
    id: 'USR-001',
    name: 'Arjun Mehta',
    email: 'admin@ezy.com',
    password: 'admin',
    role: 'admin',
    companyId: 'COM-RETAIL',
    branchId: 'BR-RET-CHN',
    avatarColor: '#2563eb',
  },
  {
    id: 'USR-002',
    name: 'Priya Nair',
    email: 'manager@ezy.com',
    password: 'manager',
    role: 'manager',
    companyId: 'COM-WHOLESALE',
    branchId: 'BR-WS-CHN',
    avatarColor: '#059669',
  },
  {
    id: 'USR-003',
    name: 'Karthik R',
    email: 'accountant@ezy.com',
    password: 'accountant',
    role: 'accountant',
    companyId: 'COM-MFG',
    branchId: 'BR-MFG-CHN',
    avatarColor: '#d97706',
  },
];

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((s) => s.app.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/app/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Find matching user in mock list
    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user || user.password !== password) {
      setError('Invalid email or password.');
      return;
    }

    // 2. Strip password before storing in Redux
    const safeUser = { ...user };
    delete safeUser.password;

    // 3. Dispatch login with user + company + branch
    dispatch(
      login({
        user: safeUser,
        companyId: safeUser.companyId,
        branchId: safeUser.branchId,
      })
    );

    // 4. Redirect to intended page
    navigate(from, { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* ─── LEFT PANEL ─── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '48%',
          maxWidth: 620,
          p: 6,
          bgcolor: '#0f172a',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -120,
            right: -120,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.35), transparent 70%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -160,
            left: -160,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.22), transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 48, height: 48, borderRadius: 2,
                bgcolor: 'primary.main', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18,
              }}
            >
              EZ
            </Box>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
                EZY ERP
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                Enterprise Suite
              </Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: 26, fontWeight: 600, lineHeight: 1.25, mt: 3 }}>
            Run your entire business<br />from one place.
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#cbd5e1', maxWidth: 380 }}>
            Sales, purchases, inventory, manufacturing, accounting, GST and reporting — connected end-to-end with real business logic.
          </Typography>
        </Stack>

        <Box sx={{ position: 'relative', zIndex: 1, mt: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 4 }}>
            {[
              { t: 'Sales & POS', d: 'Orders, invoices, returns' },
              { t: 'Purchases', d: 'POs, GRNs, payments' },
              { t: 'Inventory', d: 'Multi-warehouse stock' },
              { t: 'Manufacturing', d: 'BOMs & production' },
              { t: 'Finance', d: 'GL, P&L, balance sheet' },
              { t: 'GST Ready', d: 'GSTR-1 / GSTR-3B' },
            ].map((m) => (
              <Box
                key={m.t}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 1.5,
                  p: 1.5,
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{m.t}</Typography>
                <Typography sx={{ fontSize: 11, color: '#94a3b8', mt: 0.25 }}>{m.d}</Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 1.5,
              p: 2,
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1, color: '#e2e8f0' }}>
              Demo accounts
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {MOCK_USERS.map((u) => (
                <Box
                  key={u.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: '#cbd5e1',
                    py: 0.25,
                    gap: 2,
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{u.email}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>
                    {u.password}
                  </span>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Typography sx={{ fontSize: 11, color: '#64748b', position: 'relative', zIndex: 1, mt: 3 }}>
          © {new Date().getFullYear()} EZY ERP · Internal prototype
        </Typography>
      </Box>

      {/* ─── RIGHT PANEL ─── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 400,
            p: { xs: 3, sm: 4 },
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Stack spacing={3}>
            <Stack
              spacing={1}
              alignItems="center"
              textAlign="center"
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <Box
                sx={{
                  width: 44, height: 44, borderRadius: 2,
                  bgcolor: 'primary.main', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 18,
                }}
              >
                EZ
              </Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700 }}>EZY ERP</Typography>
            </Stack>

            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 600 }}>Sign in</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
                Enter your credentials to access the workspace
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  autoFocus
                  required
                  size="small"
                />
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          aria-label="Toggle password visibility"
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 0.5 }}>
                  Sign In
                </Button>
              </Stack>
            </Box>

            <Divider />
            <Typography sx={{ fontSize: 11, color: 'text.secondary', textAlign: 'center' }}>
              Demo credentials are listed on the left panel.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}