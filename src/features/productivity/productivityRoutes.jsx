import { lazy } from 'react';

const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const RecentPages = lazy(() => import('./pages/RecentPages'));
const ImportPreview = lazy(() => import('./pages/ImportPreview'));

export const productivityRoutes = [
  { path: '/app/favorites', element: FavoritesPage, title: 'Favorites', breadcrumb: ['Home', 'Favorites'] },
  { path: '/app/recent', element: RecentPages, title: 'Recent Pages', breadcrumb: ['Home', 'Recent'] },
  { path: '/app/tools/import', element: ImportPreview, title: 'Import Preview', breadcrumb: ['Home', 'Tools', 'Import'] },
];