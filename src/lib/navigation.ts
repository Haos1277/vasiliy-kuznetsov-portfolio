export function initNavigation(): () => void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-site-nav]');

  if (!header) return () => undefined;

  const setMenuState = (open: boolean) => {
    header.classList.toggle('is-menu-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
  };

  const onToggle = () => {
    setMenuState(toggle?.getAttribute('aria-expanded') !== 'true');
  };
  const onNavClick = (event: Event) => {
    if ((event.target as Element | null)?.closest('a')) setMenuState(false);
  };
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);

  toggle?.addEventListener('click', onToggle);
  nav?.addEventListener('click', onNavClick);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return () => {
    toggle?.removeEventListener('click', onToggle);
    nav?.removeEventListener('click', onNavClick);
    window.removeEventListener('scroll', onScroll);
  };
}
