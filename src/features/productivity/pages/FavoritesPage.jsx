import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { IconButton, Button } from '@mui/material';
import { Star, Delete } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import { selectFavorites } from '../productivitySelectors';
import { toggleFavorite } from '../productivitySlice';
import { routeByPath } from '../../../navigation/routeConfig';

export default function FavoritesPage() {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);

  const resolved = favorites
    .map((path) => ({ path, meta: routeByPath[path] }))
    .filter((r) => r.meta);

  return (
    <div>
      <PageHeader
        title="Favorites"
        description={`${resolved.length} starred page(s) · in-memory, resets on refresh`}
      />
      {resolved.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded p-8 text-center text-sm text-gray-500">
          No favorites yet. Click the ☆ star in the page header on any screen to save it here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {resolved.map(({ path, meta }) => (
            <div key={path} className="bg-white border border-gray-200 rounded p-3 flex items-start gap-2">
              <Star fontSize="small" sx={{ color: '#d97706', mt: 0.25 }} />
              <div className="flex-1 min-w-0">
                <Link to={path} className="text-sm font-medium text-blue-700 hover:underline">{meta.title}</Link>
                <div className="text-xs text-gray-500 font-mono truncate">{path}</div>
              </div>
              <IconButton size="small" onClick={() => dispatch(toggleFavorite(path))} aria-label="Remove favorite">
                <Delete fontSize="small" />
              </IconButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}