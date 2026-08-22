import { aiPhotoCollection } from '../data/ai';
import { aiVideoWorks } from '../data/videos';
import { initGallery } from '../lib/gallery';
import { initAiModes } from '../lib/ai-modes';
import { initVideoPlaylist } from '../lib/video-playlist';
import { initPortfolioShell, renderPortfolioShell } from '../shared/portfolio-shell';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/motion.css';
import '../styles/portfolio-layout.css';
import '../styles/portfolio-components.css';

const aiPageMarkup = `
  <section class="ai-portfolio" aria-label="AI-портфолио" data-ai-root data-page-content data-reveal>
    <div class="ai-mode-grid reveal-item" role="group" aria-label="Формат AI-проекта">
      <button
        class="ai-mode-card ai-mode-card--photos is-active"
        type="button"
        data-ai-mode="photos"
        aria-label="AI-фотосессии"
        aria-controls="ai-photos-panel"
        aria-pressed="true"
      >
        <span class="ai-mode-card__art" aria-hidden="true"><span></span></span>
        <span class="ai-mode-card__eyebrow">Формат 01</span>
        <span class="ai-mode-card__title">AI-фотосессии</span>
        <span class="ai-mode-card__detail">Новые образы и визуальные миры</span>
      </button>
      <button
        class="ai-mode-card ai-mode-card--video"
        type="button"
        data-ai-mode="video"
        aria-label="Видео и анимация"
        aria-controls="ai-video-panel"
        aria-pressed="false"
      >
        <span class="ai-mode-card__art" aria-hidden="true"><span></span></span>
        <span class="ai-mode-card__eyebrow">Формат 02</span>
        <span class="ai-mode-card__title">Видео и анимация</span>
        <span class="ai-mode-card__detail">Движение для невозможных кадров</span>
      </button>
    </div>
    <section
      class="ai-workspace ai-workspace--photos reveal-item"
      id="ai-photos-panel"
      data-ai-panel="photos"
      aria-label="AI-фотосессии"
    >
      <div class="gallery-stage">
        <div class="gallery-stage__frame">
          <button class="gallery-stage__image" type="button" data-gallery-open aria-label="Открыть фотографию в полном размере">
            <img data-gallery-image alt="" />
          </button>
          <p class="gallery-stage__empty" data-gallery-empty>
            <span>Серия готовится</span>
            Фотографии этой категории появятся здесь после подготовки материалов.
          </p>
        </div>
        <div class="gallery-stage__controls" aria-label="Управление галереей">
          <button class="gallery-control" type="button" data-gallery-prev aria-label="Предыдущий кадр">←</button>
          <p class="gallery-stage__count" data-gallery-count aria-live="polite">—</p>
          <button class="gallery-control" type="button" data-gallery-next aria-label="Следующий кадр">→</button>
        </div>
      </div>
      <div class="gallery-lightbox" data-lightbox role="dialog" aria-modal="true" aria-label="Полноэкранный просмотр фотографии" aria-hidden="true" hidden>
        <button class="gallery-lightbox__close" type="button" data-lightbox-close aria-label="Закрыть просмотр">×</button>
        <img data-lightbox-image alt="" />
      </div>
    </section>
    <section
      class="ai-workspace ai-workspace--video"
      id="ai-video-panel"
      data-ai-panel="video"
      aria-label="AI-видео и анимация"
      hidden
    >
      <div class="video-player" data-video-player>
        <iframe
          class="video-player__frame"
          data-video-frame
          title="AI-видеоплеер"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
        <p class="video-player__fallback" data-video-fallback hidden aria-live="polite">
          <a data-video-fallback-link target="_blank" rel="noreferrer">Открыть видео на YouTube</a>
        </p>
      </div>
      <ol class="video-work-list" data-video-list aria-label="Список AI-видео и анимации"></ol>
      <p class="video-portfolio__empty" data-video-empty hidden>
        AI-видео и анимация появятся здесь после подготовки материалов.
      </p>
    </section>
  </section>`;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderPortfolioShell({
  page: 'ai',
  eyebrow: 'Портфолио / 03',
  title: 'AI-креатор',
  intro: 'Новые визуальные миры для идей, которые нельзя снять обычной камерой.',
  content: aiPageMarkup,
  cta: {
    prompt: 'Есть идея, которую невозможно снять обычной камерой?',
    label: 'Создать AI-проект',
    service: 'AI-проект',
  },
});

const root = document.querySelector<HTMLElement>('[data-ai-root]')!;
const cleanups = [
  initPortfolioShell(),
  initAiModes(root),
  initGallery(root, [aiPhotoCollection]),
  initVideoPlaylist(root, aiVideoWorks),
];
const cleanup = () => cleanups.forEach((dispose) => dispose());

window.addEventListener('pagehide', cleanup, { once: true });
