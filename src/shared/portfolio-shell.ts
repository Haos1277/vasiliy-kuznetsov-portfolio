import { contactLinks } from '../content';
import { initNavigation } from '../lib/navigation';
import { portfolioHref, withBase } from '../lib/paths';
import { initReveal } from '../lib/reveal';

export type PortfolioPageId = 'photography' | 'video' | 'ai' | 'music';

export type BookingService =
  | 'Фотосессия'
  | 'Видеосъёмка'
  | 'AI-проект'
  | 'Музыка';

export type PortfolioCta = {
  prompt: string;
  label: string;
  service: BookingService;
};

export type PortfolioShellOptions = {
  page: PortfolioPageId;
  eyebrow: string;
  title: string;
  intro: string;
  content: string;
  cta: PortfolioCta;
};

const navigationItems: ReadonlyArray<{ page: PortfolioPageId; label: string }> = [
  { page: 'photography', label: 'Фотограф' },
  { page: 'video', label: 'Видеограф' },
  { page: 'ai', label: 'AI-креатор' },
  { page: 'music', label: 'Музыка' },
];

const renderPortfolioHeader = (page: PortfolioPageId): string => `
  <header class="site-header" data-site-header>
    <a class="brand" href="${withBase('')}" aria-label="На главную">
      <span>Василий Кузнецов</span><small>DJ_Schmied</small>
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" data-menu-toggle>
      <span>Меню</span><i aria-hidden="true"></i>
    </button>
    <nav class="site-nav" id="site-navigation" aria-label="Основная навигация" data-site-nav>
      ${navigationItems
        .map(
          (item) =>
            `<a href="${portfolioHref(item.page)}"${item.page === page ? ' aria-current="page"' : ''}>${item.label}</a>`,
        )
        .join('')}
    </nav>
    <a class="header-cta" href="${withBase('')}#booking">Обсудить проект</a>
  </header>`;

const renderPortfolioFooter = (): string => `
  <footer class="site-footer">
    <div class="site-footer__links">
      <a href="${contactLinks.telegram}" target="_blank" rel="noreferrer">Telegram <span>@wasiliy12777</span></a>
      <a href="${contactLinks.channel}" target="_blank" rel="noreferrer">Канал <span>Kinodel_Vasiliy</span></a>
      <a href="${contactLinks.instagram}" target="_blank" rel="noreferrer">Instagram <span>@vasiliy_ai</span></a>
    </div>
    <div class="site-footer__meta">
      <span>Василий Кузнецов · DJ_Schmied</span><span>© 2026</span>
    </div>
  </footer>`;

export function renderPortfolioShell(options: PortfolioShellOptions): string {
  const bookingHref = `${withBase('')}?service=${encodeURIComponent(
    options.cta.service,
  )}#booking`;

  return `
    <a class="skip-link" href="#portfolio-content">Перейти к содержанию</a>
    ${renderPortfolioHeader(options.page)}
    <main class="portfolio-main" id="portfolio-content" data-portfolio-page="${options.page}">
      <header class="portfolio-hero" data-reveal>
        <a class="portfolio-back" href="${withBase('')}">← На главную</a>
        <p class="eyebrow reveal-item">${options.eyebrow}</p>
        <h1 class="reveal-item">${options.title}</h1>
        <p class="portfolio-hero__intro reveal-item">${options.intro}</p>
      </header>
      ${options.content}
      <section class="portfolio-cta" aria-labelledby="portfolio-cta-title" data-reveal>
        <h2 id="portfolio-cta-title" class="reveal-item">${options.cta.prompt}</h2>
        <a class="button button--primary reveal-item" href="${bookingHref}">${options.cta.label}</a>
      </section>
    </main>
    ${renderPortfolioFooter()}
  `;
}

export function initPortfolioShell(): () => void {
  const cleanupNavigation = initNavigation();
  const cleanupReveal = initReveal();

  return () => {
    cleanupNavigation();
    cleanupReveal();
  };
}
