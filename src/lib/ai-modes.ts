export type AiMode = 'photos' | 'video';

const isAiMode = (value: string | undefined): value is AiMode =>
  value === 'photos' || value === 'video';

export function initAiModes(
  root: HTMLElement,
  onModeChange?: (mode: AiMode) => void,
): () => void {
  const buttons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-ai-mode]'),
  );
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>('[data-ai-panel]'),
  );

  const select = (mode: AiMode) => {
    buttons.forEach((button) => {
      const active = button.dataset.aiMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    panels.forEach((panel) => {
      panel.toggleAttribute('hidden', panel.dataset.aiPanel !== mode);
    });
    onModeChange?.(mode);
  };

  const listeners = buttons.flatMap((button) => {
    const mode = button.dataset.aiMode;
    if (!isAiMode(mode)) return [];
    const listener = () => select(mode);
    button.addEventListener('click', listener);
    return [[button, listener] as const];
  });

  select('photos');

  return () => {
    listeners.forEach(([button, listener]) => {
      button.removeEventListener('click', listener);
    });
  };
}
