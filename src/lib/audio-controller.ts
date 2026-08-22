export function initAudioController(): () => void {
  const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
  const audio = document.querySelector<HTMLAudioElement>('[data-site-audio]');
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-audio-toggle]');

  if (!video || !audio || buttons.length === 0) return () => undefined;

  video.muted = true;
  void video.play().catch(() => undefined);
  let isPlaying = false;

  const syncButtons = () => {
    buttons.forEach((button) => {
      const offLabel = button.dataset.audioLabelOff ?? 'Включить звук';
      const onLabel = button.dataset.audioLabelOn ?? 'Выключить звук';
      button.textContent = isPlaying ? onLabel : offLabel;
      button.setAttribute('aria-pressed', String(isPlaying));
    });
  };

  const onToggle = () => {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
    } else {
      isPlaying = true;
      void audio.play().catch(() => {
        isPlaying = false;
        syncButtons();
      });
    }
    syncButtons();
  };

  const onEnded = () => {
    isPlaying = false;
    syncButtons();
  };

  buttons.forEach((button) => button.addEventListener('click', onToggle));
  audio.addEventListener('ended', onEnded);
  syncButtons();

  return () => {
    buttons.forEach((button) => button.removeEventListener('click', onToggle));
    audio.removeEventListener('ended', onEnded);
  };
}
