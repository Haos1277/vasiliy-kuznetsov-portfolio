import { initPortfolioShell, renderPortfolioShell } from '../shared/portfolio-shell';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/motion.css';
import '../styles/portfolio-layout.css';
import '../styles/portfolio-components.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderPortfolioShell({
  page: 'photography',
  eyebrow: 'Портфолио / 01',
  title: 'Фотограф',
  intro: 'Свет, момент и история.',
  content: `
    <section class="portfolio-empty" aria-labelledby="photography-empty-title" data-page-content data-reveal>
      <h2 id="photography-empty-title" class="reveal-item">Материалы готовятся</h2>
      <p class="reveal-item">Скоро здесь появятся избранные фотосерии.</p>
    </section>`,
  cta: {
    prompt: 'Хотите сохранить свою историю в кадрах?',
    label: 'Записаться на фотосессию',
    service: 'Фотосессия',
  },
});

initPortfolioShell();
