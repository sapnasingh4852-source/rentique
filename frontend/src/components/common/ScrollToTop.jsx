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
    // the user touches the screen. Jump instantly instead, and jump once
    // more on the next frame: if a smooth-scroll animation from the
    // previous page was still in flight, Chromium resumes it after the
    // navigation, and the second jump cancels it. behavior:'instant'
    // overrides the CSS without touching inline styles (a synchronous
    // style flip is unreliable — Chromium may apply the scroll with the
    // restored smooth value, turning the jump into an animated glide).
    const jumpInstant = () => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } catch {
        // Very old browsers reject 'instant' in the options dictionary.
        const html = document.documentElement;
        const previous = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        html.style.scrollBehavior = previous;
      }
    };
    jumpInstant();
    requestAnimationFrame(jumpInstant);
  }, [pathname, search, navigationType]);

  return null;
}
