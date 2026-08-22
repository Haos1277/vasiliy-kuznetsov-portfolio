import { initPortfolioShell, renderPortfolioShell } from '../shared/portfolio-shell';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/motion.css';
import '../styles/portfolio-layout.css';
import '../styles/portfolio-components.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderPortfolioShell({
  page: 'video',
  eyebrow: 'Портфолио / 02',
  title: 'Видеограф',
  intro: 'Истории, которые обретают движение.',
  content: `
    <section class="portfolio-empty" aria-labelledby="video-empty-title" data-page-content data-reveal>
      <h2 id="video-empty-title" class="reveal-item">Материалы готовятся</h2>
      <p class="reveal-item">Скоро здесь появятся избранные видеоработы.</p>
    </section>`,
  cta: {
    prompt: 'Есть история, которую хочется показать в движении?',
    label: 'Обсудить видеосъёмку',
    service: 'Видеосъёмка',
  },
});

initPortfolioShell();
