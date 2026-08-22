import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

describe('portfolio page structure', () => {
  beforeAll(async () => {
    document.body.innerHTML = '<div id="app"></div>';

    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);

    await import('../src/main');
  });

  afterAll(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('separates the directions heading from the discipline cards', () => {
    const divider = document.querySelector(
      '.directions > .section-heading + .directions__divider',
    );

    expect(divider).toBeInstanceOf(HTMLHRElement);
    expect(divider?.nextElementSibling?.classList.contains('disciplines')).toBe(true);
  });

  it('renders enabled portfolio links for every discipline route', () => {
    const portfolioLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(
        '.discipline__actions a.text-link',
      ),
    ).filter((link) => link.textContent?.includes('Портфолио'));

    expect(portfolioLinks).toHaveLength(4);
    expect(portfolioLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/vasiliy-kuznetsov-portfolio/photography/',
      '/vasiliy-kuznetsov-portfolio/video/',
      '/vasiliy-kuznetsov-portfolio/ai/',
      '/vasiliy-kuznetsov-portfolio/music/',
    ]);
    expect(portfolioLinks.every((link) => !link.matches(':disabled'))).toBe(true);
  });
});
