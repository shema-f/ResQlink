import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight scroll-reveal hook. Adds `is-visible` semantics to any element
 * without pulling in an animation library. Respects prefers-reduced-motion
 * via the `.reveal` base styles in index.css.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
