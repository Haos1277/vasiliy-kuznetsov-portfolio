import { photographyCategories } from '../data/photography';
import { initGallery } from '../lib/gallery';
import { initPortfolioShell, renderPortfolioShell } from '../shared/portfolio-shell';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/motion.css';
import '../styles/portfolio-layout.css';
import '../styles/portfolio-components.css';
import '../styles/portfolio-motion.css';

const categoryRail = photographyCategories
  .map(
    (category, index) => `
      <button
        class="gallery-category${index === 0 ? ' is-active' : ''}"
        type="button"
        data-gallery-category="${category.id}"
        aria-pressed="${String(index === 0)}"
      >
        <span class="gallery-category__image">
          <img src="${category.cardImage}" alt="" width="800" height="1000" loading="lazy" />
        </span>
        <span class="gallery-category__title">${category.title}</span>
      </button>`,
  )
  .join('');

const galleryMarkup = `
  <section class="photography-gallery" aria-label="Фотогалерея" data-gallery-root data-page-content data-reveal>
    <div class="photography-gallery__rail" aria-label="Категории фотосъёмки">
      ${categoryRail}
    </div>
    <div class="gallery-stage reveal-item">
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
  </section>`;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderPortfolioShell({
  page: 'photography',
  eyebrow: 'Портфолио / 01',
  title: 'Фотограф',
  intro: 'Свет, момент и история.',
  content: galleryMarkup,
  cta: {
    prompt: 'Хотите сохранить свою историю в кадрах?',
    label: 'Записаться на фотосессию',
    service: 'Фотосессия',
  },
});

initPortfolioShell();
initGallery(
  document.querySelector<HTMLElement>('[data-gallery-root]')!,
  photographyCategories,
);
