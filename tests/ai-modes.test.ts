import { afterEach, describe, expect, it } from 'vitest';

import { initAiModes } from '../src/lib/ai-modes';
import { initVideoPlaylist } from '../src/lib/video-playlist';

const mountAiFixture = (): HTMLElement => {
  document.body.innerHTML = `
    <section data-ai-modes>
      <button type="button" data-ai-mode="photos">AI-фотосессии</button>
      <button type="button" data-ai-mode="video">Видео и анимация</button>
      <section data-ai-panel="photos"></section>
      <section data-ai-panel="video">
        <div data-video-player>
          <iframe data-video-frame></iframe>
          <p data-video-watch hidden><a data-video-watch-link></a></p>
          <p data-video-fallback hidden><a data-video-fallback-link></a></p>
        </div>
        <ol data-video-list></ol>
        <p data-video-empty hidden>No videos yet.</p>
      </section>
    </section>`;

  return document.querySelector<HTMLElement>('[data-ai-modes]')!;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('AI mode controller', () => {
  it('shows exactly one AI workspace at a time', () => {
    const root = mountAiFixture();
    const cleanup = initAiModes(root);

    expect(root.querySelector('[data-ai-panel="photos"]')?.hasAttribute('hidden')).toBe(false);
    expect(root.querySelector('[data-ai-panel="video"]')?.hasAttribute('hidden')).toBe(true);

    root.querySelector<HTMLButtonElement>('[data-ai-mode="video"]')!.click();

    expect(root.querySelector('[data-ai-panel="photos"]')?.hasAttribute('hidden')).toBe(true);
    expect(root.querySelector('[data-ai-panel="video"]')?.hasAttribute('hidden')).toBe(false);
    expect(root.querySelector('[data-ai-mode="video"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-ai-mode="photos"]')?.getAttribute('aria-pressed')).toBe('false');
    cleanup();
  });

  it('removes mode listeners on cleanup', () => {
    const root = mountAiFixture();
    const cleanup = initAiModes(root);
    cleanup();

    root.querySelector<HTMLButtonElement>('[data-ai-mode="video"]')!.click();

    expect(root.querySelector('[data-ai-panel="photos"]')?.hasAttribute('hidden')).toBe(false);
    expect(root.querySelector('[data-ai-panel="video"]')?.hasAttribute('hidden')).toBe(true);
  });

  it('unloads selected video when the visitor returns to photo mode', () => {
    const root = mountAiFixture();
    const video = initVideoPlaylist(root, [
      {
        id: 'ai-1',
        youtubeId: 'dQw4w9WgXcQ',
        title: 'AI animation',
        category: 'ai',
      },
    ]);
    const modes = initAiModes(root, (mode) => {
      if (mode === 'photos') video.stop();
    });

    root.querySelector<HTMLButtonElement>('[data-ai-mode="video"]')!.click();
    root.querySelector<HTMLButtonElement>('[data-video-work="ai-1"]')!.click();
    const frame = root.querySelector<HTMLIFrameElement>('[data-video-frame]')!;
    expect(frame.getAttribute('src')).toContain('/embed/dQw4w9WgXcQ?autoplay=1');

    root.querySelector<HTMLButtonElement>('[data-ai-mode="photos"]')!.click();
    expect(frame.getAttribute('src')).toBeNull();

    root.querySelector<HTMLButtonElement>('[data-ai-mode="video"]')!.click();
    expect(frame.getAttribute('src')).toBeNull();
    modes();
    video();
  });
});
