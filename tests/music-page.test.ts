import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MusicTrack } from '../src/lib/music-types';
import { formatTime } from '../src/lib/music-player';

afterEach(() => {
  document.body.innerHTML = '';
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('DJ_Schmied music page', () => {
  it('formats finite nonnegative durations with the player time semantics', () => {
    expect(formatTime(278.28)).toBe('04:38');
    expect(formatTime(65.9)).toBe('01:05');
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(-1)).toBe('00:00');
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe('00:00');
  });

  it('renders each playlist row duration from its track data', async () => {
    const tracks: readonly MusicTrack[] = [
      {
        id: 'long-track',
        title: 'Long track',
        artist: 'DJ_Schmied',
        src: 'media/long-track.mp3',
        duration: 278.28,
        peaks: [],
      },
      {
        id: 'short-track',
        title: 'Short track',
        artist: 'DJ_Schmied',
        src: 'media/short-track.mp3',
        duration: 65.9,
        peaks: [],
      },
    ];

    document.body.innerHTML = '<div id="app"></div>';
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { renderMusicPlaylist } = await import('../src/pages/music');
    const playlist = renderMusicPlaylist(tracks);

    expect(playlist).toContain('datetime="PT278S">04:38</time>');
    expect(playlist).toContain('datetime="PT65S">01:05</time>');
  });

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
