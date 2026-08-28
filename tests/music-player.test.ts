import { afterEach, describe, expect, it, vi } from 'vitest';

import { musicTracks } from '../src/data/music';
import type { MusicTrack } from '../src/lib/music-types';
import { initMusicPlayer } from '../src/lib/music-player';

const fixtureTracks: readonly MusicTrack[] = [
  {
    id: 'track-1',
    title: 'First track',
    artist: 'DJ_Schmied',
    src: 'media/track-1.mp3',
    duration: 180,
    peaks: [0.1, 0.5, 1],
  },
  {
    id: 'track-2',
    title: 'Second track',
    artist: 'DJ_Schmied',
    src: 'media/track-2.mp3',
    duration: 240,
    peaks: [1, 0.5, 0.1],
  },
  {
    id: 'track-3',
    title: 'Third track',
    artist: 'DJ_Schmied',
    src: 'media/track-3.mp3',
    duration: 60,
    peaks: [0.2, 0.4, 0.6],
  },
];

const mountMusicFixture = (tracks: readonly MusicTrack[] = fixtureTracks): HTMLElement => {
  const root = document.createElement('section');
  root.innerHTML = `
    <audio data-music-audio></audio>
    <p data-music-title></p>
    <time data-music-current></time>
    <time data-music-duration></time>
    <button data-music-play></button>
    <button data-music-prev></button>
    <button data-music-next></button>
    <input data-music-seek type="range" min="0" max="1" step="0.001" value="0">
    <canvas data-music-waveform></canvas>
    <input data-music-volume type="range" min="0" max="1" step="0.01" value="1">
    <button data-music-shuffle></button>
    <button data-music-repeat></button>
    <p data-music-error hidden></p>
    ${tracks.map((track) => `<button data-music-track="${track.id}">${track.title}</button>`).join('')}
  `;
  document.body.append(root);
  root.querySelector<HTMLAudioElement>('[data-music-audio]')!.pause = vi.fn();
  const canvas = root.querySelector<HTMLCanvasElement>('[data-music-waveform]')!;
  Object.defineProperties(canvas, {
    clientWidth: { configurable: true, value: 200 },
    clientHeight: { configurable: true, value: 40 },
  });
  vi.spyOn(canvas, 'getContext').mockReturnValue(null);
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 200 } as DOMRect);
  return root;
};

const setDuration = (audio: HTMLAudioElement, duration: number): void => {
  Object.defineProperty(audio, 'duration', { configurable: true, value: duration });
};

const deferred = (): { promise: Promise<void>; resolve: () => void } => {
  let resolve = (): void => undefined;
  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('music player controller', () => {
  it('keeps the real one-track playlist unloaded until its first explicit play action', () => {
    const root = mountMusicFixture(musicTracks);
    const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
    const play = root.querySelector<HTMLButtonElement>('[data-music-play]')!;
    audio.play = vi.fn().mockResolvedValue(undefined);

    const cleanup = initMusicPlayer(root, musicTracks);

    expect(audio.hasAttribute('src')).toBe(false);
    expect(play.dataset.state).toBe('paused');
    expect(play.textContent).toBe('');
    expect(root.querySelector('[data-music-title]')?.textContent).toBe(
      'A storm covers the sky with darkness',
    );
    expect(root.querySelector('[data-music-duration]')?.textContent).toBe('04:38');
    expect(root.querySelector('[data-music-track]')?.getAttribute('aria-current')).toBe('true');

    play.click();

    expect(audio.src).toContain('/media/dj-schmied-storm.mp3');
    expect(audio.play).toHaveBeenCalledOnce();
    expect(play.dataset.state).toBe('playing');
    expect(play.textContent).toBe('');
    cleanup();
  });

  it('loads only an explicitly selected track and synchronizes exact range and waveform seeks', () => {
    const root = mountMusicFixture();
    const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
    audio.play = vi.fn().mockResolvedValue(undefined);
    setDuration(audio, 240);
    const cleanup = initMusicPlayer(root, fixtureTracks);

    root.querySelector<HTMLButtonElement>('[data-music-track="track-2"]')!.click();
    expect(audio.src).toContain('/media/track-2.mp3');
    expect(root.querySelector('[data-music-title]')?.textContent).toBe('Second track');
    expect(root.querySelector('[data-music-track="track-2"]')?.getAttribute('aria-current')).toBe('true');
    expect(root.querySelector('[data-music-track="track-1"]')?.hasAttribute('aria-current')).toBe(false);

    const seek = root.querySelector<HTMLInputElement>('[data-music-seek]')!;
    seek.value = '0.5';
    seek.dispatchEvent(new Event('input'));
    expect(audio.currentTime).toBe(120);

    const waveform = root.querySelector<HTMLCanvasElement>('[data-music-waveform]')!;
    const pointer = new MouseEvent('pointerdown', { bubbles: true, clientX: 50 });
    Object.defineProperty(pointer, 'pointerId', { value: 1 });
    waveform.dispatchEvent(pointer);
    expect(audio.currentTime).toBe(60);
    cleanup();
  });

  it('updates metadata, times, volume, active controls, and only runs one animation frame while playing', () => {
    const root = mountMusicFixture();
    const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
    audio.play = vi.fn().mockResolvedValue(undefined);
    audio.pause = vi.fn();
    setDuration(audio, 240);
    const requestAnimationFrame = vi.fn(() => 17);
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);
    const cleanup = initMusicPlayer(root, fixtureTracks);

    root.querySelector<HTMLButtonElement>('[data-music-play]')!.click();
    audio.dispatchEvent(new Event('loadedmetadata'));
    audio.currentTime = 60;
    audio.dispatchEvent(new Event('timeupdate'));
    audio.dispatchEvent(new Event('play'));
    audio.dispatchEvent(new Event('play'));

    expect(root.querySelector('[data-music-current]')?.textContent).toBe('01:00');
    expect(root.querySelector<HTMLInputElement>('[data-music-seek]')!.value).toBe('0.25');
    expect(root.querySelector('[data-music-duration]')?.textContent).toBe('04:00');
    expect(root.querySelector<HTMLButtonElement>('[data-music-play]')?.getAttribute('aria-pressed')).toBe('true');
    expect(requestAnimationFrame).toHaveBeenCalledOnce();

    const volume = root.querySelector<HTMLInputElement>('[data-music-volume]')!;
    volume.value = '0.3';
    volume.dispatchEvent(new Event('input'));
    audio.dispatchEvent(new Event('volumechange'));
    expect(audio.volume).toBeCloseTo(0.3);
    expect(volume.value).toBe('0.3');

    root.querySelector<HTMLButtonElement>('[data-music-shuffle]')!.click();
    root.querySelector<HTMLButtonElement>('[data-music-repeat]')!.click();
    expect(root.querySelector<HTMLButtonElement>('[data-music-shuffle]')?.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector<HTMLButtonElement>('[data-music-repeat]')?.getAttribute('aria-pressed')).toBe('true');

    audio.dispatchEvent(new Event('pause'));
    expect(cancelAnimationFrame).toHaveBeenCalledWith(17);
    cleanup();
  });

  it('advances on end, repeats one track when requested, and keeps a rejected play recoverable', async () => {
    const root = mountMusicFixture();
    const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
    audio.play = vi.fn().mockResolvedValue(undefined);
    setDuration(audio, 180);
    const cleanup = initMusicPlayer(root, fixtureTracks);

    root.querySelector<HTMLButtonElement>('[data-music-play]')!.click();
    audio.dispatchEvent(new Event('ended'));
    expect(audio.src).toContain('/media/track-2.mp3');

    root.querySelector<HTMLButtonElement>('[data-music-repeat]')!.click();
    root.querySelector<HTMLButtonElement>('[data-music-repeat]')!.click();
    audio.currentTime = 123;
    audio.dispatchEvent(new Event('ended'));
    expect(audio.src).toContain('/media/track-2.mp3');
    expect(audio.currentTime).toBe(0);

    audio.play = vi.fn().mockRejectedValue(new Error('blocked'));
    root.querySelector<HTMLButtonElement>('[data-music-next]')!.click();
    await Promise.resolve();
    const error = root.querySelector<HTMLElement>('[data-music-error]')!;
    expect(error.hidden).toBe(false);
    expect(error.textContent).toContain('Не удалось');
    expect(root.querySelector<HTMLButtonElement>('[data-music-play]')?.getAttribute('aria-pressed')).toBe('false');
    cleanup();
  });

  it('advances when the browser dispatches pause before the ended event', () => {
    const root = mountMusicFixture();
    const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
    audio.play = vi.fn().mockResolvedValue(undefined);
    const cleanup = initMusicPlayer(root, fixtureTracks);

    root.querySelector<HTMLButtonElement>('[data-music-play]')!.click();
    audio.dispatchEvent(new Event('pause'));
    audio.dispatchEvent(new Event('ended'));

    expect(audio.src).toContain('/media/track-2.mp3');
    expect(audio.play).toHaveBeenCalledTimes(2);
    cleanup();
  });

  it('restarts the current track when pause precedes ended in repeat-one mode', () => {
    const root = mountMusicFixture();
    const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
    audio.play = vi.fn().mockResolvedValue(undefined);
    const cleanup = initMusicPlayer(root, fixtureTracks);

    root.querySelector<HTMLButtonElement>('[data-music-track="track-2"]')!.click();
    root.querySelector<HTMLButtonElement>('[data-music-repeat]')!.click();
    root.querySelector<HTMLButtonElement>('[data-music-repeat]')!.click();
    audio.currentTime = 123;
    audio.dispatchEvent(new Event('pause'));
    audio.dispatchEvent(new Event('ended'));

    expect(audio.src).toContain('/media/track-2.mp3');
    expect(audio.currentTime).toBe(0);
    expect(audio.play).toHaveBeenCalledTimes(2);
    cleanup();
  });

  it('wraps to the first track when pause precedes ended in repeat-all mode', () => {
    const root = mountMusicFixture();
    const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
    audio.play = vi.fn().mockResolvedValue(undefined);
    const cleanup = initMusicPlayer(root, fixtureTracks);

    root.querySelector<HTMLButtonElement>('[data-music-track="track-3"]')!.click();
    root.querySelector<HTMLButtonElement>('[data-music-repeat]')!.click();
    audio.dispatchEvent(new Event('pause'));
    audio.dispatchEvent(new Event('ended'));

    expect(audio.src).toContain('/media/track-1.mp3');
    expect(audio.play).toHaveBeenCalledTimes(2);
    cleanup();
  });

  it('remains stopped at the non-repeating end when pause precedes ended', () => {
    const root = mountMusicFixture();
    const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
    audio.play = vi.fn().mockResolvedValue(undefined);
    const cleanup = initMusicPlayer(root, fixtureTracks);

    root.querySelector<HTMLButtonElement>('[data-music-track="track-3"]')!.click();
    audio.dispatchEvent(new Event('pause'));
    audio.dispatchEvent(new Event('ended'));

    expect(audio.src).toContain('/media/track-3.mp3');
    expect(audio.play).toHaveBeenCalledOnce();
    expect(root.querySelector<HTMLButtonElement>('[data-music-play]')?.getAttribute('aria-pressed')).toBe('false');
    cleanup();
  });

  it('stops the media element when next reaches the non-repeating playlist boundary', () => {
    const root = mountMusicFixture();
    const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
    audio.play = vi.fn().mockResolvedValue(undefined);
    audio.pause = vi.fn();
    const cleanup = initMusicPlayer(root, fixtureTracks);

    root.querySelector<HTMLButtonElement>('[data-music-track="track-3"]')!.click();
    root.querySelector<HTMLButtonElement>('[data-music-next]')!.click();

    expect(audio.pause).toHaveBeenCalledOnce();
    expect(root.querySelector<HTMLButtonElement>('[data-music-play]')?.getAttribute('aria-pressed')).toBe('false');
    cleanup();
  });

  it('is safe for an empty playlist and detaches all control listeners on cleanup', () => {
    const root = mountMusicFixture([]);
    const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
    audio.play = vi.fn().mockResolvedValue(undefined);
    const cleanup = initMusicPlayer(root, []);

    root.querySelector<HTMLButtonElement>('[data-music-play]')!.click();
    expect(audio.hasAttribute('src')).toBe(false);
    expect(audio.play).not.toHaveBeenCalled();

    cleanup();
    root.querySelector<HTMLButtonElement>('[data-music-play]')!.click();
    root.querySelector<HTMLButtonElement>('[data-music-next]')!.click();
    expect(audio.play).not.toHaveBeenCalled();
  });

  it('pauses active playback and leaves a resolved pending play unable to revive detached UI', async () => {
    const root = mountMusicFixture();
    const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
    const pendingPlay = deferred();
    audio.play = vi.fn(() => pendingPlay.promise);
    audio.pause = vi.fn();
    const requestAnimationFrame = vi.fn(() => 11);
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);
    setDuration(audio, 240);
    const cleanup = initMusicPlayer(root, fixtureTracks);
    const waveform = root.querySelector<HTMLCanvasElement>('[data-music-waveform]')!;

    root.querySelector<HTMLButtonElement>('[data-music-play]')!.click();
    audio.dispatchEvent(new Event('play'));
    expect(requestAnimationFrame).toHaveBeenCalledOnce();

    cleanup();
    pendingPlay.resolve();
    await Promise.resolve();
    audio.dispatchEvent(new Event('play'));
    audio.currentTime = 9;
    audio.dispatchEvent(new Event('pause'));
    const pointer = new MouseEvent('pointerdown', { bubbles: true, clientX: 100 });
    Object.defineProperty(pointer, 'pointerId', { value: 8 });
    waveform.dispatchEvent(pointer);

    expect(audio.pause).toHaveBeenCalledOnce();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(11);
    expect(requestAnimationFrame).toHaveBeenCalledOnce();
    expect(root.querySelector<HTMLButtonElement>('[data-music-play]')?.getAttribute('aria-pressed')).toBe('false');
    expect(root.querySelector('[data-music-current]')?.textContent).toBe('00:00');
    expect(root.classList.contains('is-playing')).toBe(false);
    expect(audio.currentTime).toBe(9);
  });

  it('pauses a newly selected pending track after a stale pause and ignores a second cleanup', async () => {
    const root = mountMusicFixture();
    const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
    const firstPlay = deferred();
    const secondPlay = deferred();
    audio.play = vi.fn().mockReturnValueOnce(firstPlay.promise).mockReturnValueOnce(secondPlay.promise);
    audio.pause = vi.fn();
    const requestAnimationFrame = vi.fn(() => 12);
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const cleanup = initMusicPlayer(root, fixtureTracks);

    root.querySelector<HTMLButtonElement>('[data-music-play]')!.click();
    root.querySelector<HTMLButtonElement>('[data-music-track="track-2"]')!.click();
    audio.dispatchEvent(new Event('pause'));
    cleanup();
    cleanup();

    secondPlay.resolve();
    await Promise.resolve();
    audio.dispatchEvent(new Event('play'));

    expect(audio.pause).toHaveBeenCalledOnce();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(root.querySelector('[data-music-title]')?.textContent).toBe('Second track');
    expect(root.querySelector<HTMLButtonElement>('[data-music-play]')?.getAttribute('aria-pressed')).toBe('false');
    expect(root.classList.contains('is-playing')).toBe(false);
  });
});
