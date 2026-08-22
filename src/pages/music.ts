import { initPortfolioShell, renderPortfolioShell } from '../shared/portfolio-shell';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/motion.css';
import '../styles/portfolio-layout.css';
import '../styles/portfolio-components.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderPortfolioShell({
  page: 'music',
  eyebrow: 'Портфолио / 04',
  title: 'DJ_Schmied',
  intro: 'Авторский звук для историй, которым нужен собственный ритм.',
  content: `
    <section class="portfolio-empty" aria-labelledby="music-empty-title" data-page-content data-reveal>
      <h2 id="music-empty-title" class="reveal-item">Материалы готовятся</h2>
      <p class="reveal-item">Скоро здесь появятся авторские композиции DJ_Schmied.</p>
    </section>`,
  cta: {
    prompt: 'Вашему проекту нужен собственный звук?',
    label: 'Обсудить музыку',
    service: 'Музыка',
  },
});

initPortfolioShell();
