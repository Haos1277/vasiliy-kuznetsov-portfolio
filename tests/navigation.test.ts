import { afterEach, describe, expect, it } from 'vitest';

import { initNavigation } from '../src/lib/navigation';

describe('navigation', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens and closes the accessible mobile menu', () => {
    document.body.innerHTML = `
      <header data-site-header>
        <button data-menu-toggle aria-expanded="false">Меню</button>
        <nav data-site-nav>
          <a href="#about">Обо мне</a>
        </nav>
      </header>
    `;

    const cleanup = initNavigation();
    const button = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')!;
    const header = document.querySelector<HTMLElement>('[data-site-header]')!;

    button.click();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(header.classList.contains('is-menu-open')).toBe(true);

    document.querySelector<HTMLAnchorElement>('nav a')!.click();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(header.classList.contains('is-menu-open')).toBe(false);
    cleanup();
  });

  it('marks the header after scrolling', () => {
    document.body.innerHTML = '<header data-site-header></header>';
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 40 });

    const cleanup = initNavigation();
    window.dispatchEvent(new Event('scroll'));

    expect(document.querySelector('header')?.classList.contains('is-scrolled')).toBe(
      true,
    );
    cleanup();
  });
});
