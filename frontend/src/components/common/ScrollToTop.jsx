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
    // The global CSS sets scroll-behavior: smooth, which turns this into a
    // long animated scroll — on phones it stutters and stops midway when
    // the user touches the screen. Force an instant jump instead.
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.style.scrollBehavior = previous;
  }, [pathname, search, navigationType]);

  return null;
}
