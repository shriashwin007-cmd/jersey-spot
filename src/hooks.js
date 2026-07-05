import { useEffect, useState } from 'react';

// Shared breakpoint hook: several scroll-driven / drag effects use fixed
// pixel offsets tuned for a wide desktop container — those same offsets are
// a much bigger fraction of a narrow phone viewport, so components read
// this flag to swap in tighter, mobile-appropriate ranges.
export function useIsCompact(query = '(max-width: 720px)') {
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setCompact(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return compact;
}
