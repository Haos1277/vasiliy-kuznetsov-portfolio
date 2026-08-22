import { afterEach, describe, expect, it } from 'vitest';

import { initAiModes } from '../src/lib/ai-modes';

const mountAiFixture = (): HTMLElement => {
  document.body.innerHTML = `
    <section data-ai-modes>
      <button type="button" data-ai-mode="photos">AI-фотосессии</button>
      <button type="button" data-ai-mode="video">Видео и анимация</button>
      <section data-ai-panel="photos"></section>
      <section data-ai-panel="video"></section>
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
});
