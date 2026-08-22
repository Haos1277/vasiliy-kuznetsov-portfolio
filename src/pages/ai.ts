import { initPortfolioShell, renderPortfolioShell } from '../shared/portfolio-shell';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/motion.css';
import '../styles/portfolio-layout.css';
import '../styles/portfolio-components.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderPortfolioShell({
  page: 'ai',
  eyebrow: 'Портфолио / 03',
  title: 'AI-креатор',
  intro: 'Новые визуальные миры для идей, которые нельзя снять обычной камерой.',
  content: `
    <section class="portfolio-empty" aria-labelledby="ai-empty-title" data-page-content data-reveal>
      <h2 id="ai-empty-title" class="reveal-item">Материалы готовятся</h2>
      <p class="reveal-item">Скоро здесь появятся AI-фотосессии, видео и анимация.</p>
    </section>`,
  cta: {
    prompt: 'Есть идея, которую невозможно снять обычной камерой?',
    label: 'Создать AI-проект',
    service: 'AI-проект',
  },
});

initPortfolioShell();
