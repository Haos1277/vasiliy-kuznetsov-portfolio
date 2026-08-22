import type { GalleryCollection, GalleryItem } from './gallery-types';
import {
  closeLightbox,
  createGalleryState,
  moveFrame,
  openLightbox,
  selectCategory,
} from './gallery-state';

const swipeThreshold = 48;

export function initGallery<Id extends string>(
  root: HTMLElement,
  categories: readonly [GalleryCollection<Id>, ...GalleryCollection<Id>[]],
): () => void {
  const categoryIds = categories.map(({ id }) => id) as [Id, ...Id[]];
  let state = createGalleryState(categoryIds);
  let pointerStartX: number | undefined;
  let focusReturnTarget: HTMLElement | undefined;
  let suppressOpen = false;

  const categoryButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-gallery-category]'),
  );
  const image = root.querySelector<HTMLImageElement>('[data-gallery-image]');
  const imageButton = root.querySelector<HTMLButtonElement>('[data-gallery-open]');
  const previousButton = root.querySelector<HTMLButtonElement>('[data-gallery-prev]');
  const nextButton = root.querySelector<HTMLButtonElement>('[data-gallery-next]');
  const count = root.querySelector<HTMLElement>('[data-gallery-count]');
  const emptyState = root.querySelector<HTMLElement>('[data-gallery-empty]');
  const lightbox = root.querySelector<HTMLElement>('[data-lightbox]');
  const lightboxImage = root.querySelector<HTMLImageElement>('[data-lightbox-image]');
  const lightboxCloseButton = root.querySelector<HTMLButtonElement>('[data-lightbox-close]');

  const getActiveCategory = () =>
    categories.find(({ id }) => id === state.activeCategory);

  const renderLightbox = (item?: GalleryItem) => {
    const open = state.lightboxOpen && Boolean(item);
    if (lightbox) {
      lightbox.setAttribute('aria-hidden', String(!open));
      lightbox.hidden = !open;
    }
    if (open && item && lightboxImage) {
      lightboxImage.src = item.full;
      lightboxImage.alt = item.alt;
      lightboxImage.width = item.width;
      lightboxImage.height = item.height;
    }
  };

  const closeViewer = () => {
    if (!state.lightboxOpen) return;
    state = closeLightbox(state);
    render();
    focusReturnTarget?.focus();
    focusReturnTarget = undefined;
  };

  const renderCurrentImage = (
    item: GalleryItem | undefined,
    index: number,
    length: number,
  ) => {
    const hasItem = Boolean(item);
    emptyState?.toggleAttribute('hidden', hasItem);
    imageButton && (imageButton.disabled = !hasItem);
    if (previousButton) previousButton.disabled = !hasItem;
    if (nextButton) nextButton.disabled = !hasItem;
    if (count) {
      count.textContent = hasItem
        ? `${String(index + 1).padStart(2, '0')} / ${String(length).padStart(2, '0')}`
        : '—';
    }

    if (!item) {
      image?.removeAttribute('src');
      image?.setAttribute('alt', '');
      renderLightbox();
      return;
    }

    if (image) {
      image.src = item.thumbnail;
      image.alt = item.alt;
      image.width = item.width;
      image.height = item.height;
    }
    renderLightbox(item);

    const adjacentIndexes = new Set([
      (index - 1 + length) % length,
      (index + 1) % length,
    ]);
    adjacentIndexes.delete(index);
    adjacentIndexes.forEach((adjacentIndex) => {
      const preload = new Image();
      preload.src = getActiveCategory()!.items[adjacentIndex].full;
    });
  };

  const render = () => {
    const category = getActiveCategory();
    if (!category) return;
    const index = state.indexByCategory[category.id];
    const item = category.items[index];
    root.dataset.activeCategory = category.id;
    categoryButtons.forEach((button) => {
      const active = button.dataset.galleryCategory === category.id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderCurrentImage(item, index, category.items.length);
  };

  const changeFrame = (direction: -1 | 1) => {
    const category = getActiveCategory();
    if (!category) return;
    state = moveFrame(state, direction, category.items.length);
    render();
  };

  const openViewer = () => {
    if (suppressOpen) {
      suppressOpen = false;
      return;
    }
    const category = getActiveCategory();
    const item = category?.items[state.indexByCategory[state.activeCategory]];
    if (!item) return;
    focusReturnTarget = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : imageButton ?? undefined;
    state = openLightbox(state);
    render();
    lightboxCloseButton?.focus();
  };

  const trapFocus = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !state.lightboxOpen || !lightbox) return;
    const focusable = Array.from(
      lightbox.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1)!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeViewer();
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      changeFrame(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      changeFrame(1);
    }
    trapFocus(event);
  };

  const onPointerDown = (event: PointerEvent) => {
    pointerStartX = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (pointerStartX === undefined) return;
    const distance = event.clientX - pointerStartX;
    pointerStartX = undefined;
    if (Math.abs(distance) < swipeThreshold) return;
    suppressOpen = true;
    changeFrame(distance < 0 ? 1 : -1);
    window.setTimeout(() => {
      suppressOpen = false;
    });
  };
  const onPointerCancel = () => {
    pointerStartX = undefined;
  };

  const bindings: Array<[EventTarget, string, EventListenerOrEventListenerObject]> = [];
  const listen = <Target extends EventTarget>(
    target: Target | null,
    event: string,
    listener: EventListenerOrEventListenerObject,
  ) => {
    if (!target) return;
    target.addEventListener(event, listener);
    bindings.push([target, event, listener]);
  };

  categoryButtons.forEach((button) => {
    listen(button, 'click', () => {
      const id = button.dataset.galleryCategory as Id | undefined;
      if (!id || !categories.some((category) => category.id === id)) return;
      state = selectCategory(state, id);
      render();
    });
  });
  listen(previousButton, 'click', () => changeFrame(-1));
  listen(nextButton, 'click', () => changeFrame(1));
  listen(imageButton, 'click', openViewer);
  listen(lightboxCloseButton, 'click', closeViewer);
  listen(document, 'keydown', onKeydown as EventListener);
  listen(imageButton, 'pointerdown', onPointerDown as EventListener);
  listen(imageButton, 'pointerup', onPointerUp as EventListener);
  listen(imageButton, 'pointercancel', onPointerCancel);

  render();

  return () => {
    bindings.forEach(([target, event, listener]) => target.removeEventListener(event, listener));
  };
}
