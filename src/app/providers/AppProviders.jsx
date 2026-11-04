import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../store';
import ThemeProvider from './ThemeProvider';

export default function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}