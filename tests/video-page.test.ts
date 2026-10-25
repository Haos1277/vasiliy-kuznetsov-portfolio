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
    expect(document.querySelectorAll('[data-video-native]')).toHaveLength(1);
    expect(player).not.toBeNull();
    expect(
      [...document.querySelectorAll('[data-video-filter]')].map((item) =>
        item.textContent?.trim(),
      ),
    ).toEqual(['Все работы', 'Концерты', 'Индивидуальные съёмки']);
    expect(document.querySelectorAll('[data-video-list]')).toHaveLength(1);
  });

  it('keeps the player unloaded and presents every supplied work', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));

    await import('../src/pages/video');

    const frame = document.querySelector<HTMLIFrameElement>('[data-video-frame]');
    const native = document.querySelector<HTMLVideoElement>('[data-video-native]');
    const player = document.querySelector<HTMLElement>('[data-video-player]');
    expect(frame?.getAttribute('src')).toBeNull();
    expect(native?.getAttribute('src')).toBeNull();
    expect(native?.hidden).toBe(true);
    expect(player?.hidden).toBe(false);
    expect(document.querySelectorAll('[data-video-work]')).toHaveLength(23);
    expect(document.querySelector<HTMLElement>('[data-video-empty]')?.hidden).toBe(true);
    expect(document.querySelector('[data-video-fallback]')).not.toBeNull();
    expect(document.querySelector('.portfolio-cta')?.textContent).toContain(
      'Есть история, которую хочется показать в движении?',
    );
    expect(document.querySelector('.portfolio-cta a')?.textContent?.trim()).toBe(
      'Обсудить видеосъёмку',
    );
  });
});
