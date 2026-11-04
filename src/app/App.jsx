import AppProviders from './providers/AppProviders';
import AppRouter from './router';
import CommandPaletteModal from '../features/productivity/components/CommandPaletteModal';
import KeyboardShortcuts from '../features/productivity/pages/KeyboardShortcuts';
import { useKeyboardShortcuts } from '../features/productivity/hooks/useKeyboardShortcuts';

function AppShell() {
  useKeyboardShortcuts();
  return (
    <>
      <AppRouter />
      <CommandPaletteModal />
      <KeyboardShortcuts />
    </>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}