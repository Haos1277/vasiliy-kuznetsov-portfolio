import type { VideoCategory, VideoWork } from '../data/videos';
import { isYouTubeId, youtubeEmbedUrl, youtubeWatchUrl } from './youtube';

export type VideoFilter<Category extends string = VideoCategory> = 'all' | Category;

const playerPermissions =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

export const filterVideoWorks = <Category extends string>(
  works: readonly VideoWork<Category>[],
  filter: VideoFilter<Category>,
): readonly VideoWork<Category>[] =>
  filter === 'all' ? works : works.filter(({ category }) => category === filter);

export function initVideoPlaylist<Category extends string>(
  root: HTMLElement,
  works: readonly VideoWork<Category>[],
): () => void {
  let activeFilter: VideoFilter<Category> = 'all';
  let activeWorkId: string | undefined;

  const frame = root.querySelector<HTMLIFrameElement>('[data-video-frame]');
  const player = root.querySelector<HTMLElement>('[data-video-player]') ?? frame;
  const list = root.querySelector<HTMLElement>('[data-video-list]');
  const emptyState = root.querySelector<HTMLElement>('[data-video-empty]');
  const fallback = root.querySelector<HTMLElement>('[data-video-fallback]');
  const filterButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-video-filter]'),
  );

  const getFallbackLink = (): HTMLAnchorElement | null => {
    if (fallback instanceof HTMLAnchorElement) return fallback;
    const existingLink = fallback?.querySelector<HTMLAnchorElement>('a');
    if (existingLink) return existingLink;
    if (!fallback) return null;

    const link = document.createElement('a');
    fallback.append(link);
    return link;
  };

  const hideFallback = () => {
    fallback?.setAttribute('hidden', '');
  };

  const setFallbackMessage = (message: string) => {
    if (!fallback) return;
    let messageElement = fallback.querySelector<HTMLElement>(
      '[data-video-fallback-message]',
    );
    if (!messageElement) {
      messageElement = document.createElement('span');
      messageElement.dataset.videoFallbackMessage = '';
      fallback.prepend(messageElement);
    }
    messageElement.textContent = message;
  };

  const showUnavailableFallback = () => {
    const link = getFallbackLink();
    if (link) {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      if (link !== fallback) link.hidden = true;
    }
    setFallbackMessage('Видео недоступно. Попробуйте позже.');
    fallback?.removeAttribute('hidden');
  };

  const showFallback = (work: VideoWork<Category>) => {
    if (!isYouTubeId(work.youtubeId)) {
      showUnavailableFallback();
      return;
    }
    const link = getFallbackLink();
    if (!link) return;
    link.href = youtubeWatchUrl(work.youtubeId);
    link.hidden = false;
    link.removeAttribute('aria-disabled');
    if (!link.textContent?.trim()) link.textContent = 'Открыть видео на YouTube';
    setFallbackMessage('Не удалось загрузить видео. ');
    fallback?.removeAttribute('hidden');
  };

  const getActiveWork = () => works.find(({ id }) => id === activeWorkId);

  const render = () => {
    const visibleWorks = filterVideoWorks(works, activeFilter);
    root.dataset.activeVideoFilter = activeFilter;
    filterButtons.forEach((button) => {
      const active = button.dataset.videoFilter === activeFilter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    emptyState?.toggleAttribute('hidden', visibleWorks.length > 0);
    if (!list) return;

    list.replaceChildren(
      ...visibleWorks.map((work, index) => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.videoWork = work.id;
        button.className = 'video-work';
        const active = work.id === activeWorkId;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));

        const metadata = [
          work.category,
          work.year ? String(work.year) : undefined,
          work.duration,
        ].filter(Boolean);
        button.innerHTML = `<span class="video-work__number">${String(index + 1).padStart(2, '0')}</span><span class="video-work__title"></span><span class="video-work__meta"></span>`;
        button.querySelector<HTMLElement>('.video-work__title')!.textContent = work.title;
        button.querySelector<HTMLElement>('.video-work__meta')!.textContent = metadata.join(' · ');
        item.append(button);
        return item;
      }),
    );
  };

  const selectWork = (work: VideoWork<Category>) => {
    activeWorkId = work.id;
    if (!isYouTubeId(work.youtubeId)) {
      frame?.removeAttribute('src');
      showUnavailableFallback();
      render();
      return;
    }
    hideFallback();
    if (frame) {
      frame.src = youtubeEmbedUrl(work.youtubeId, true);
      frame.title = `Видео: ${work.title}`;
      frame.setAttribute('allow', playerPermissions);
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    }
    render();
    if (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 820px)').matches) {
      player?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const bindings: Array<[EventTarget, string, EventListener]> = [];
  const listen = (target: EventTarget | null, event: string, listener: EventListener) => {
    if (!target) return;
    target.addEventListener(event, listener);
    bindings.push([target, event, listener]);
  };

  filterButtons.forEach((button) => {
    listen(button, 'click', () => {
      activeFilter = (button.dataset.videoFilter ?? 'all') as VideoFilter<Category>;
      render();
    });
  });

  listen(list, 'click', (event) => {
    const target = event.target instanceof Element
      ? event.target.closest<HTMLElement>('[data-video-work]')
      : null;
    const work = works.find(({ id }) => id === target?.dataset.videoWork);
    if (work) selectWork(work);
  });

  listen(frame, 'error', () => {
    const work = getActiveWork();
    if (work) showFallback(work);
  });

  render();

  return () => {
    bindings.forEach(([target, event, listener]) => {
      target.removeEventListener(event, listener);
    });
  };
}
