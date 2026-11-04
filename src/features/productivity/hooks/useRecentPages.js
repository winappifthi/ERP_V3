import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { trackVisit } from '../productivitySlice';
import { routeByPath } from '../../../navigation/routeConfig';

export function useRecentPages() {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const meta = routeByPath[location.pathname];
    if (meta) {
      dispatch(trackVisit({ path: location.pathname, title: meta.title }));
    }
  }, [location.pathname, dispatch]);
}