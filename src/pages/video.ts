import { videoWorks } from '../data/videos';
import { initVideoPlaylist } from '../lib/video-playlist';
import { initPortfolioShell, renderPortfolioShell } from '../shared/portfolio-shell';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/motion.css';
import '../styles/portfolio-layout.css';
import '../styles/portfolio-components.css';

const videoPageMarkup = `
  <section class="video-portfolio" aria-label="Видеоработы" data-video-root data-page-content data-reveal>
    <div class="video-player reveal-item" data-video-player>
      <iframe
        class="video-player__frame"
        data-video-frame
        title="Видеоплеер"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
      <p class="video-player__watch" data-video-watch hidden>
        <a data-video-watch-link target="_blank" rel="noreferrer">Открыть видео на YouTube</a>
      </p>
      <p class="video-player__fallback" data-video-fallback hidden aria-live="polite">
        <a data-video-fallback-link target="_blank" rel="noreferrer">Открыть видео на YouTube</a>
      </p>
    </div>
    <div class="video-portfolio__filters reveal-item" data-video-filters aria-label="Фильтр видеоработ">
      <button class="video-filter is-active" type="button" data-video-filter="all" aria-pressed="true">Все работы</button>
      <button class="video-filter" type="button" data-video-filter="concert" aria-pressed="false">Концерты</button>
      <button class="video-filter" type="button" data-video-filter="individual" aria-pressed="false">Индивидуальные съёмки</button>
    </div>
    <ol class="video-work-list reveal-item" data-video-list aria-label="Список видеоработ"></ol>
    <p class="video-portfolio__empty reveal-item" data-video-empty hidden>
      Видеоработы появятся здесь после подготовки материалов.
    </p>
  </section>`;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderPortfolioShell({
  page: 'video',
  eyebrow: 'Портфолио / 02',
  title: 'Видеограф',
  intro: 'Истории, которые обретают движение.',
  content: videoPageMarkup,
  cta: {
    prompt: 'Есть история, которую хочется показать в движении?',
    label: 'Обсудить видеосъёмку',
    service: 'Видеосъёмка',
  },
});

initPortfolioShell();
initVideoPlaylist(
  document.querySelector<HTMLElement>('[data-video-root]')!,
  videoWorks,
);
