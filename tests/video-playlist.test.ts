import { afterEach, describe, expect, it, vi } from 'vitest';

import type { VideoWork } from '../src/data/videos';
import {
  filterVideoWorks,
  initVideoPlaylist,
} from '../src/lib/video-playlist';

const fixtureWorks = [
  {
    id: 'concert-1',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Concert one',
    category: 'concert',
    year: 2026,
    duration: '03:32',
  },
  {
    id: 'individual-1',
    youtubeId: '9bZkp7q19f0',
    title: 'Individual one',
    category: 'individual',
  },
  {
    id: 'concert-2',
    youtubeId: '3JZ_D3ELwOQ',
    title: 'Concert two',
    category: 'concert',
  },
] as const satisfies readonly VideoWork<'concert' | 'individual'>[];

const aiWorks = [
  {
    id: 'ai-1',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'AI animation',
    category: 'ai',
  },
] as const satisfies readonly VideoWork<'ai'>[];

const malformedWorks = [
  fixtureWorks[0],
  {
    id: 'broken-1',
    youtubeId: 'not a video id',
    title: 'Unavailable video',
    category: 'concert',
  },
] as const satisfies readonly VideoWork<'concert'>[];

const mountVideoFixture = (filters = ['all', 'concert', 'individual']): HTMLElement => {
  document.body.innerHTML = `
    <section data-video-root>
      <div data-video-player>
        <iframe data-video-frame></iframe>
        <p data-video-fallback hidden><a data-video-fallback-link></a></p>
      </div>
      <div>${filters
        .map(
          (filter) =>
            `<button type="button" data-video-filter="${filter}">${filter}</button>`,
        )
        .join('')}</div>
      <ol data-video-list></ol>
      <p data-video-empty hidden>No videos yet.</p>
    </section>`;

  return document.querySelector<HTMLElement>('[data-video-root]')!;
};

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('video playlist controller', () => {
  it('filters without changing the original work order', () => {
    expect(filterVideoWorks(fixtureWorks, 'concert').map(({ id }) => id)).toEqual([
      'concert-1',
      'concert-2',
    ]);
    expect(filterVideoWorks(fixtureWorks, 'all')).toEqual(fixtureWorks);
  });

  it('does not load a video when a filter changes', () => {
    const root = mountVideoFixture();
    const cleanup = initVideoPlaylist(root, fixtureWorks);

    root.querySelector<HTMLButtonElement>('[data-video-filter="concert"]')!.click();

    const frame = root.querySelector<HTMLIFrameElement>('[data-video-frame]')!;
    expect(frame.getAttribute('src')).toBeNull();
    expect(root.querySelectorAll('[data-video-work]')).toHaveLength(2);
    expect(root.querySelector('[data-video-filter="concert"]')!.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-video-filter="all"]')!.getAttribute('aria-pressed')).toBe('false');
    cleanup();
  });

  it('loads only the concrete work that the visitor clicks into one accessible player', () => {
    const root = mountVideoFixture();
    const cleanup = initVideoPlaylist(root, fixtureWorks);

    root.querySelector<HTMLButtonElement>('[data-video-work="concert-1"]')!.click();

    const frame = root.querySelector<HTMLIFrameElement>('[data-video-frame]')!;
    expect(frame.src).toContain('/embed/dQw4w9WgXcQ?autoplay=1&rel=0');
    expect(frame.title).toBe('Видео: Concert one');
    expect(frame.getAttribute('allow')).toBe(
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    );
    expect(frame.hasAttribute('allowfullscreen')).toBe(true);
    expect(frame.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin');
    expect(root.querySelectorAll('[data-video-frame]')).toHaveLength(1);
    expect(root.querySelector('[data-video-work="concert-1"]')!.classList.contains('is-active')).toBe(true);
    expect(root.querySelector('[data-video-work="individual-1"]')!.classList.contains('is-active')).toBe(false);
    cleanup();
  });

  it('reveals a direct watch link when the selected iframe fails', () => {
    const root = mountVideoFixture();
    const cleanup = initVideoPlaylist(root, fixtureWorks);
    root.querySelector<HTMLButtonElement>('[data-video-work="individual-1"]')!.click();
    root.querySelector<HTMLIFrameElement>('[data-video-frame]')!.dispatchEvent(new Event('error'));

    const fallback = root.querySelector<HTMLElement>('[data-video-fallback]')!;
    const link = root.querySelector<HTMLAnchorElement>('[data-video-fallback-link]')!;
    expect(fallback.hidden).toBe(false);
    expect(link.href).toBe('https://www.youtube.com/watch?v=9bZkp7q19f0');
    cleanup();
  });

  it('shows a safe readable fallback for a malformed ID without loading or crashing', () => {
    const root = mountVideoFixture();
    const cleanup = initVideoPlaylist(root, malformedWorks);
    const frame = root.querySelector<HTMLIFrameElement>('[data-video-frame]')!;
    const fallback = root.querySelector<HTMLElement>('[data-video-fallback]')!;
    const link = root.querySelector<HTMLAnchorElement>('[data-video-fallback-link]')!;

    root.querySelector<HTMLButtonElement>('[data-video-work="concert-1"]')!.click();
    expect(frame.getAttribute('src')).not.toBeNull();
    root.querySelector<HTMLButtonElement>('[data-video-work="broken-1"]')!.click();

    expect(frame.getAttribute('src')).toBeNull();
    expect(fallback.hidden).toBe(false);
    expect(fallback.textContent).toContain('Видео недоступно');
    expect(link.hasAttribute('href')).toBe(false);
    expect(link.hidden).toBe(true);

    cleanup();
    fallback.hidden = true;
    root.querySelector<HTMLButtonElement>('[data-video-work="broken-1"]')!.click();
    expect(fallback.hidden).toBe(true);
    expect(frame.getAttribute('src')).toBeNull();
  });

  it('scrolls to the player only for a mobile work selection', () => {
    const root = mountVideoFixture();
    const player = root.querySelector<HTMLElement>('[data-video-player]')!;
    const scrollIntoView = vi.fn();
    Object.assign(player, { scrollIntoView });
    const matchMedia = vi.fn().mockReturnValue({ matches: false });
    Object.assign(window, { matchMedia });
    const cleanup = initVideoPlaylist(root, fixtureWorks);

    root.querySelector<HTMLButtonElement>('[data-video-work="concert-1"]')!.click();
    expect(scrollIntoView).not.toHaveBeenCalled();

    matchMedia.mockReturnValue({ matches: true });
    root.querySelector<HTMLButtonElement>('[data-video-work="concert-2"]')!.click();
    expect(matchMedia).toHaveBeenLastCalledWith('(max-width: 820px)');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    cleanup();
  });

  it('supports a separate generic AI category and renders a readable empty list', () => {
    const aiRoot = mountVideoFixture(['all', 'ai']);
    const aiCleanup = initVideoPlaylist(aiRoot, aiWorks);
    aiRoot.querySelector<HTMLButtonElement>('[data-video-filter="ai"]')!.click();
    expect(aiRoot.querySelectorAll('[data-video-work]')).toHaveLength(1);
    expect(aiRoot.querySelector('[data-video-empty]')!.hasAttribute('hidden')).toBe(true);
    aiCleanup();

    const emptyRoot = mountVideoFixture();
    const emptyCleanup = initVideoPlaylist(emptyRoot, []);
    expect(emptyRoot.querySelector('[data-video-empty]')!.hasAttribute('hidden')).toBe(false);
    expect(emptyRoot.querySelector('[data-video-empty]')!.textContent).toContain('No videos yet.');
    expect(emptyRoot.querySelector('[data-video-list]')!.textContent).toBe('');
    emptyCleanup();
  });

  it('removes filter, work, and iframe-error listeners on cleanup', () => {
    const root = mountVideoFixture();
    const cleanup = initVideoPlaylist(root, fixtureWorks);
    const frame = root.querySelector<HTMLIFrameElement>('[data-video-frame]')!;
    cleanup();

    root.querySelector<HTMLButtonElement>('[data-video-filter="concert"]')!.click();
    expect(root.querySelectorAll('[data-video-work]')).toHaveLength(3);
    root.querySelector<HTMLButtonElement>('[data-video-work="concert-1"]')!.click();
    expect(frame.getAttribute('src')).toBeNull();
    frame.dispatchEvent(new Event('error'));
    expect(root.querySelector<HTMLElement>('[data-video-fallback]')!.hidden).toBe(true);
  });
});
