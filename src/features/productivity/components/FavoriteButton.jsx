import { IconButton, Tooltip } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { selectFavorites } from '../productivitySelectors';
import { toggleFavorite } from '../productivitySlice';

export default function FavoriteButton() {
  const dispatch = useDispatch();
  const location = useLocation();
  const favorites = useSelector(selectFavorites);
  const isFavorite = favorites.includes(location.pathname);

  return (
    <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
      <IconButton
        size="small"
        onClick={() => dispatch(toggleFavorite(location.pathname))}
        aria-label="Toggle favorite"
        sx={{ color: isFavorite ? '#d97706' : undefined }}
      >
        {isFavorite ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}