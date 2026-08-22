export function initReveal(): () => void {
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    elements.forEach((element) => element.classList.add('is-visible'));
    return () => undefined;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
  );

  elements.forEach((element) => observer.observe(element));
  return () => observer.disconnect();
}
