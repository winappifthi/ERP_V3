import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';

export const ezyTheme = createTheme({
  palette: {
    primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8', contrastText: '#fff' },
    success: { main: '#059669' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' },
    grey: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 700: '#374151', 900: '#111827' },
    background: { default: '#f6f7f9', paper: '#ffffff' },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1.05rem' },
    body2: { fontSize: '0.8125rem' },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true, size: 'small' } },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiSelect: { defaultProps: { size: 'small' } },
    MuiTableCell: { styleOverrides: { root: { fontSize: '0.8125rem' } } },
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid #e5e7eb' } } },
  },
});

export default function ThemeProvider({ children }) {
  return (
    <MuiThemeProvider theme={ezyTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}