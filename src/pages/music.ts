import { musicTracks } from '../data/music';
import type { MusicTrack } from '../lib/music-types';
import { formatTime, initMusicPlayer, toWholeSeconds } from '../lib/music-player';
import { withBase } from '../lib/paths';
import { initPortfolioShell, renderPortfolioShell } from '../shared/portfolio-shell';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/motion.css';
import '../styles/portfolio-layout.css';
import '../styles/portfolio-components.css';
import '../styles/portfolio-motion.css';

export const renderMusicPlaylist = (tracks: readonly MusicTrack[]): string =>
  tracks
    .map(
      (track, index) => `
            <li>
              <button class="music-track" type="button" data-music-track="${track.id}">
                <span class="music-track__number">${String(index + 1).padStart(2, '0')}</span>
                <span class="music-track__title">${track.title}</span>
                <span class="music-track__artist">${track.artist}</span>
                <time class="music-track__duration" datetime="PT${toWholeSeconds(track.duration)}S">${formatTime(track.duration)}</time>
              </button>
            </li>`,
    )
    .join('');

const musicPageMarkup = `
  <section class="music-portfolio" aria-label="Композиции DJ_Schmied" data-music-root data-page-content data-reveal>
    <div class="music-player reveal-item">
      <figure class="music-player__cover-frame" aria-label="Обложка DJ_Schmied">
        <img
          class="music-player__cover"
          src="${withBase('media/music.webp')}"
          alt="DJ_Schmied"
          width="1600"
          height="1067"
        />
      </figure>
      <div class="music-player__panel">
        <p class="music-player__eyebrow">Авторская композиция</p>
        <h2 class="music-player__title" data-music-title>A storm covers the sky with darkness</h2>
        <p class="music-player__artist">DJ_Schmied</p>

        <audio data-music-audio preload="none"></audio>
        <div class="music-player__timeline" aria-label="Позиция воспроизведения">
          <time data-music-current aria-label="Текущее время">00:00</time>
          <label class="music-player__seek-label" for="music-seek">Перемотка композиции</label>
          <input
            id="music-seek"
            class="music-player__seek"
            type="range"
            min="0"
            max="1"
            step="0.001"
            value="0"
            data-music-seek
          />
          <time data-music-duration aria-label="Длительность композиции">04:38</time>
        </div>
        <canvas class="music-player__waveform" data-music-waveform aria-hidden="true"></canvas>

        <div class="music-player__transport" aria-label="Управление воспроизведением">
          <button class="music-player__control" type="button" data-music-prev aria-label="Предыдущая композиция">Назад</button>
          <button class="music-player__play" type="button" data-music-play aria-pressed="false">Воспроизвести</button>
          <button class="music-player__control" type="button" data-music-next aria-label="Следующая композиция">Вперёд</button>
        </div>

        <div class="music-player__options" aria-label="Настройки воспроизведения">
          <button class="music-player__option" type="button" data-music-shuffle aria-pressed="false">Случайно</button>
          <button class="music-player__option" type="button" data-music-repeat aria-pressed="false">Повтор</button>
          <details class="music-player__secondary">
            <summary>Громкость</summary>
            <label for="music-volume">Громкость</label>
            <input
              id="music-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value="1"
              data-music-volume
            />
          </details>
        </div>
        <p class="music-player__error" data-music-error role="status" aria-live="polite" hidden></p>
      </div>
    </div>

    <ol class="music-playlist reveal-item" aria-label="Список композиций">
      ${renderMusicPlaylist(musicTracks)}
    </ol>
  </section>`;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderPortfolioShell({
  page: 'music',
  eyebrow: 'Портфолио / 04',
  title: 'DJ_Schmied',
  intro: 'Авторский звук для историй, которым нужен собственный ритм.',
  content: musicPageMarkup,
  cta: {
    prompt: 'Вашему проекту нужен собственный звук?',
    label: 'Обсудить музыку',
    service: 'Музыка',
  },
});

const root = document.querySelector<HTMLElement>('[data-music-root]')!;
const cleanups = [initPortfolioShell(), initMusicPlayer(root, musicTracks)];
const cleanup = (): void => cleanups.forEach((dispose) => dispose());

window.addEventListener('pagehide', cleanup, { once: true });
