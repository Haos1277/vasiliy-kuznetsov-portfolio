import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  document.body.innerHTML = '';
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('DJ_Schmied music page', () => {
  it('renders the usable one-track player without loading audio before play', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    await import('../src/pages/music');

    const audio = document.querySelector<HTMLAudioElement>('[data-music-audio]');
    expect(document.querySelectorAll('[data-music-audio]')).toHaveLength(1);
    expect(audio?.getAttribute('preload')).toBe('none');
    expect(audio?.getAttribute('src')).toBeNull();
    expect(document.querySelectorAll('[data-music-waveform]')).toHaveLength(1);
    expect(document.querySelector('[data-music-play]')).not.toBeNull();
    expect(document.querySelector('[data-music-seek]')).not.toBeNull();
    expect(document.querySelector<HTMLImageElement>('.music-player__cover')?.src).toContain(
      '/media/music.webp',
    );
    expect(document.querySelectorAll('[data-music-track]')).toHaveLength(1);
    expect(document.querySelector('[data-music-track]')?.textContent).toContain(
      'A storm covers the sky with darkness',
    );
    expect(document.querySelector('.portfolio-cta')?.textContent).toContain(
      'Вашему проекту нужен собственный звук?',
    );
    expect(document.querySelector('.portfolio-cta a')?.textContent?.trim()).toBe('Обсудить музыку');
  });
});
