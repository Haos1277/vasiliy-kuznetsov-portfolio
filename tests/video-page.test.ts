import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  document.body.innerHTML = '';
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('videographer page', () => {
  it('renders one player, approved filters, and one work list', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));

    await import('../src/pages/video');

    const player = document.querySelector<HTMLElement>('[data-video-player]');
    expect(document.querySelectorAll('[data-video-frame]')).toHaveLength(1);
    expect(player).not.toBeNull();
    expect(
      [...document.querySelectorAll('[data-video-filter]')].map((item) =>
        item.textContent?.trim(),
      ),
    ).toEqual(['Все работы', 'Концерты', 'Индивидуальные съёмки']);
    expect(document.querySelectorAll('[data-video-list]')).toHaveLength(1);
  });

  it('keeps the player unloaded and presents the truthful empty state', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));

    await import('../src/pages/video');

    const frame = document.querySelector<HTMLIFrameElement>('[data-video-frame]');
    expect(frame?.getAttribute('src')).toBeNull();
    expect(document.querySelector('[data-video-empty]')?.textContent).toContain(
      'Видеоработы появятся здесь после подготовки материалов.',
    );
    expect(document.querySelector('[data-video-fallback]')).not.toBeNull();
    expect(document.querySelector('.portfolio-cta')?.textContent).toContain(
      'Есть история, которую хочется показать в движении?',
    );
    expect(document.querySelector('.portfolio-cta a')?.textContent?.trim()).toBe(
      'Обсудить видеосъёмку',
    );
  });
});
