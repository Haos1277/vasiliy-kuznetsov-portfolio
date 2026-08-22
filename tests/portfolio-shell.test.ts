import { describe, expect, it } from 'vitest';

import { renderPortfolioShell } from '../src/shared/portfolio-shell';

describe('portfolio shell', () => {
  it('renders shared navigation, page content, and service-aware CTA', () => {
    const html = renderPortfolioShell({
      page: 'photography',
      eyebrow: 'Портфолио / 01',
      title: 'Фотограф',
      intro: 'Свет, момент и история.',
      content: '<section data-page-content>Галерея</section>',
      cta: {
        prompt: 'Хотите сохранить свою историю в кадрах?',
        label: 'Записаться на фотосессию',
        service: 'Фотосессия',
      },
    });

    expect(html).toContain('data-portfolio-page="photography"');
    expect(html).toContain('data-page-content');
    expect(html).toContain(
      'service=%D0%A4%D0%BE%D1%82%D0%BE%D1%81%D0%B5%D1%81%D1%81%D0%B8%D1%8F',
    );
    expect(html).toContain('#booking');
  });
});
