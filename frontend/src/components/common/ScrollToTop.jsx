import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Scrolls the window back to the top after every in-app navigation
 * (page change, catalog filter update, etc.). Browser back/forward
 * (POP) is left alone so users return to where they were.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') return;
    window.scrollTo(0, 0);
  }, [pathname, search, navigationType]);

  return null;
}
