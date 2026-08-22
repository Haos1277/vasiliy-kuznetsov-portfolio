import { afterEach, describe, expect, it, vi } from 'vitest';

import { initReveal } from '../src/lib/reveal';

describe('reveal animation', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  it('reveals an element once it enters the viewport', () => {
    document.body.innerHTML = '<section data-reveal></section>';
    let observerCallback: IntersectionObserverCallback = () => undefined;
    const observe = vi.fn();
    const unobserve = vi.fn();

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          observerCallback = callback;
        }
        observe = observe;
        unobserve = unobserve;
        disconnect = vi.fn();
      },
    );

    initReveal();
    const section = document.querySelector<HTMLElement>('[data-reveal]')!;
    expect(observe).toHaveBeenCalledWith(section);

    observerCallback(
      [
        { isIntersecting: true, target: section } as unknown as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );

    expect(section.classList.contains('is-visible')).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(section);
  });
});
