import { afterEach, describe, expect, it, vi } from 'vitest';

import { initAudioController } from '../src/lib/audio-controller';

describe('hero audio controller', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps the video muted and controls the separate full track', () => {
    document.body.innerHTML = `
      <video data-hero-video muted></video>
      <audio data-site-audio></audio>
      <button data-audio-toggle>Включить звук</button>
    `;
    const video = document.querySelector<HTMLVideoElement>('video')!;
    const audio = document.querySelector<HTMLAudioElement>('audio')!;
    const button = document.querySelector<HTMLButtonElement>('button')!;
    video.muted = true;
    video.play = vi.fn().mockResolvedValue(undefined);
    audio.play = vi.fn().mockResolvedValue(undefined);
    audio.pause = vi.fn();

    const cleanup = initAudioController();
    expect(video.muted).toBe(true);
    expect(video.play).toHaveBeenCalledTimes(1);

    button.click();
    expect(video.muted).toBe(true);
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(button.textContent).toBe('Выключить звук');

    button.click();
    expect(video.muted).toBe(true);
    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(button.textContent).toBe('Включить звук');
    cleanup();
  });

  it('supports a music-specific label on the sound-section button', () => {
    document.body.innerHTML = `
      <video data-hero-video muted></video>
      <audio data-site-audio></audio>
      <button
        data-audio-toggle
        data-audio-label-off="Включить музыку"
        data-audio-label-on="Остановить музыку"
      ></button>
    `;
    const video = document.querySelector<HTMLVideoElement>('video')!;
    const audio = document.querySelector<HTMLAudioElement>('audio')!;
    const button = document.querySelector<HTMLButtonElement>('button')!;
    video.play = vi.fn().mockResolvedValue(undefined);
    audio.play = vi.fn().mockResolvedValue(undefined);
    audio.pause = vi.fn();

    const cleanup = initAudioController();
    expect(button.textContent).toBe('Включить музыку');
    button.click();
    expect(button.textContent).toBe('Остановить музыку');
    cleanup();
  });
});
