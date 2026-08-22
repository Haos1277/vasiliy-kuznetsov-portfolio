# Portfolio Pages Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four GitHub Pages-safe portfolio routes, shared page chrome, active links from the home page, and service-aware CTA return links.

**Architecture:** Keep the existing framework-free Vite application and add four real HTML entry points. Each entry imports a focused TypeScript page module while shared shell, paths, navigation, reveal behavior, and portfolio styles remain reusable. Vite Rollup input explicitly builds every HTML file under the repository base path.

**Tech Stack:** Vite 8, TypeScript 7, semantic HTML, CSS, Vitest with jsdom, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-22-portfolio-pages-design.md`

## Global Constraints

- Routes are exactly `photography/`, `video/`, `ai/`, and `music/` beneath `/vasiliy-kuznetsov-portfolio/`.
- Existing home-page visual design, typography, background, navigation, booking flow, audio, and animation remain intact.
- Every local URL is built from `import.meta.env.BASE_URL`; no root-domain paths are allowed.
- Every portfolio page has a home link, shared menu, individual CTA copy, and keyboard-visible focus.
- Motion respects `prefers-reduced-motion: reduce`.
- This plan does not fabricate portfolio works or track names.

---

### Task 1: Multi-page route contracts

**Files:**
- Create: `src/lib/paths.ts`
- Create: `tests/paths.test.ts`
- Modify: `vite.config.ts`
- Create: `photography/index.html`
- Create: `video/index.html`
- Create: `ai/index.html`
- Create: `music/index.html`
- Create: `src/pages/photography.ts`
- Create: `src/pages/video.ts`
- Create: `src/pages/ai.ts`
- Create: `src/pages/music.ts`

**Interfaces:**
- Produces: `type PortfolioRoute = 'photography' | 'video' | 'ai' | 'music'`.
- Produces: `withBase(path: string): string`.
- Produces: `portfolioHref(route: PortfolioRoute): string`.
- Produces four HTML entry points consumed by later page modules.

- [ ] **Step 1: Write the failing path tests**

```ts
import { describe, expect, it } from 'vitest';
import { portfolioHref, withBase } from '../src/lib/paths';

describe('portfolio paths', () => {
  it('keeps assets and pages under the configured base path', () => {
    expect(withBase('media/photo.webp')).toBe(
      '/vasiliy-kuznetsov-portfolio/media/photo.webp',
    );
    expect(portfolioHref('photography')).toBe(
      '/vasiliy-kuznetsov-portfolio/photography/',
    );
  });
});
```

- [ ] **Step 2: Run the path test and confirm the red state**

Run: `npm test -- tests/paths.test.ts`

Expected: FAIL because `src/lib/paths.ts` does not exist.

- [ ] **Step 3: Implement the path helpers**

```ts
export type PortfolioRoute = 'photography' | 'video' | 'ai' | 'music';

export const withBase = (path: string): string => {
  const cleanPath = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};

export const portfolioHref = (route: PortfolioRoute): string =>
  withBase(`${route}/`);
```

- [ ] **Step 4: Add all HTML inputs to Vite**

Use `fileURLToPath` and `URL` from `node:url` and set:

```ts
build: {
  target: 'es2022',
  rollupOptions: {
    input: {
      home: fileURLToPath(new URL('./index.html', import.meta.url)),
      photography: fileURLToPath(new URL('./photography/index.html', import.meta.url)),
      video: fileURLToPath(new URL('./video/index.html', import.meta.url)),
      ai: fileURLToPath(new URL('./ai/index.html', import.meta.url)),
      music: fileURLToPath(new URL('./music/index.html', import.meta.url)),
    },
  },
},
```

Each new HTML file must copy the approved metadata/font links from `index.html`, contain `<div id="app"></div>`, and import its exact module:

```html
<script type="module" src="/src/pages/photography.ts"></script>
```

Use the matching module filename for the other three pages.

Create each imported page module with `export {};` so this task's multi-page build is independently green. Task 2 replaces these minimal bootstraps with the shared shell.

- [ ] **Step 5: Run the path tests and build**

Run:

```bash
npm test -- tests/paths.test.ts
npm run build
test -s dist/photography/index.html
test -s dist/video/index.html
test -s dist/ai/index.html
test -s dist/music/index.html
```

Expected: tests pass and all four built HTML files exist.

- [ ] **Step 6: Commit the route foundation**

```bash
git add vite.config.ts photography/index.html video/index.html ai/index.html music/index.html src/pages/photography.ts src/pages/video.ts src/pages/ai.ts src/pages/music.ts src/lib/paths.ts tests/paths.test.ts
git commit -m "Add portfolio page routes"
```

---

### Task 2: Shared portfolio shell

**Files:**
- Create: `src/shared/portfolio-shell.ts`
- Create: `src/styles/portfolio-layout.css`
- Create: `src/styles/portfolio-components.css`
- Create: `tests/portfolio-shell.test.ts`
- Modify: `src/pages/photography.ts`
- Modify: `src/pages/video.ts`
- Modify: `src/pages/ai.ts`
- Modify: `src/pages/music.ts`

**Interfaces:**
- Consumes: `withBase()` from `src/lib/paths.ts`.
- Produces: `type PortfolioPageId = 'photography' | 'video' | 'ai' | 'music'`.
- Produces: `type PortfolioCta = { prompt: string; label: string; service: BookingService }`.
- Produces: `renderPortfolioShell(options: PortfolioShellOptions): string`.
- Produces: `initPortfolioShell(): () => void`.

- [ ] **Step 1: Write the failing shell tests**

```ts
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
    expect(html).toContain('service=%D0%A4%D0%BE%D1%82%D0%BE%D1%81%D0%B5%D1%81%D1%81%D0%B8%D1%8F');
    expect(html).toContain('#booking');
  });
});
```

- [ ] **Step 2: Run the shell test and confirm the red state**

Run: `npm test -- tests/portfolio-shell.test.ts`

Expected: FAIL because the shared shell does not exist.

- [ ] **Step 3: Implement the shared shell contract**

```ts
export type BookingService =
  | 'Фотосессия'
  | 'Видеосъёмка'
  | 'AI-проект'
  | 'Музыка';

export type PortfolioShellOptions = {
  page: 'photography' | 'video' | 'ai' | 'music';
  eyebrow: string;
  title: string;
  intro: string;
  content: string;
  cta: { prompt: string; label: string; service: BookingService };
};

const renderPortfolioHeader = (): string => `
  <header class="site-header" data-site-header>
    <a class="brand" href="${withBase('')}" aria-label="На главную">
      <span>Василий Кузнецов</span><small>DJ_Schmied</small>
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" data-menu-toggle>
      <span>Меню</span><i aria-hidden="true"></i>
    </button>
    <nav class="site-nav" id="site-navigation" aria-label="Основная навигация" data-site-nav>
      <a href="${portfolioHref('photography')}">Фотограф</a>
      <a href="${portfolioHref('video')}">Видеограф</a>
      <a href="${portfolioHref('ai')}">AI-креатор</a>
      <a href="${portfolioHref('music')}">Музыка</a>
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
    ${renderPortfolioHeader()}
    <main id="portfolio-content" data-portfolio-page="${options.page}">
      <header class="portfolio-hero" data-reveal>
        <a class="portfolio-back" href="${withBase('')}">← На главную</a>
        <p class="eyebrow">${options.eyebrow}</p>
        <h1>${options.title}</h1>
        <p class="portfolio-hero__intro">${options.intro}</p>
      </header>
      ${options.content}
      <section class="portfolio-cta">
        <h2>${options.cta.prompt}</h2>
        <a class="button button--primary" href="${bookingHref}">${options.cta.label}</a>
      </section>
    </main>
    ${renderPortfolioFooter()}
  `;
}
```

Import `contactLinks` from `src/content.ts` and `portfolioHref` plus `withBase` from `src/lib/paths.ts`.

`initPortfolioShell()` must call `initNavigation()` and `initReveal()` and return a cleanup function that invokes both cleanups.

- [ ] **Step 4: Add minimal entry modules**

Each page module imports the shared CSS and renders one exact shell with an accessible empty-state content section. Example CTA values:

```ts
const cta = {
  prompt: 'Хотите сохранить свою историю в кадрах?',
  label: 'Записаться на фотосессию',
  service: 'Фотосессия',
} as const;
```

Use the approved text from the spec for the other three pages. Initialize the shared shell after assigning `#app.innerHTML`.

- [ ] **Step 5: Implement the shared responsive styling**

Import existing tokens/base styles and add rules for `.portfolio-hero`, `.portfolio-main`, `.portfolio-cta`, `.portfolio-empty`, mobile menu alignment, 0.2 mm white borders, and the existing graphite background. At 820 px and below, use a single-column layout. Under reduced motion, remove transitions and transforms.

- [ ] **Step 6: Run shell tests and full regression checks**

Run:

```bash
npm test -- tests/portfolio-shell.test.ts tests/navigation.test.ts tests/reveal.test.ts
npm run build
```

Expected: all selected tests pass and Vite builds five HTML entry points.

- [ ] **Step 7: Commit the shared shell**

```bash
git add src/shared/portfolio-shell.ts src/styles/portfolio-layout.css src/styles/portfolio-components.css src/pages/photography.ts src/pages/video.ts src/pages/ai.ts src/pages/music.ts tests/portfolio-shell.test.ts
git commit -m "Build shared portfolio page shell"
```

---

### Task 3: Home links and service preselection

**Files:**
- Modify: `src/main.ts`
- Modify: `src/content.ts`
- Modify: `src/lib/booking.ts`
- Modify: `tests/booking.test.ts`
- Modify: `tests/page-structure.test.ts`

**Interfaces:**
- Consumes: `portfolioHref()`.
- Produces: active portfolio anchors on the home page.
- Produces: `readBookingService(search: string): BookingService | null`.
- `initBookingForm()` consumes the current address query string and preselects a valid service.

- [ ] **Step 1: Write failing tests for active links and service parsing**

```ts
it('accepts only approved services from the URL', () => {
  expect(readBookingService('?service=Музыка')).toBe('Музыка');
  expect(readBookingService('?service=Неизвестно')).toBeNull();
});

it('preselects the service provided by a portfolio CTA', () => {
  history.replaceState({}, '', '/?service=Видеосъёмка#booking');
  document.body.innerHTML = `
    <section id="booking"><form data-booking-form>
      <select name="service">
        <option value="">Выберите услугу</option>
        <option>Видеосъёмка</option>
      </select>
    </form></section>`;
  initBookingForm();
  expect(document.querySelector<HTMLSelectElement>('select')?.value).toBe(
    'Видеосъёмка',
  );
});
```

Add a page-structure expectation that all four `.text-link` portfolio actions are enabled anchors with their approved route suffixes.

- [ ] **Step 2: Run the focused tests and confirm failures**

Run: `npm test -- tests/booking.test.ts tests/page-structure.test.ts`

Expected: FAIL because URL preselection and active links are absent.

- [ ] **Step 3: Implement service parsing and active links**

Use an immutable allowlist of the four `BookingService` values. In `initBookingForm()`, preselect only when the query value is allowed and the matching `<option>` exists. Replace each disabled placeholder portfolio button with:

```html
<a class="text-link" href="${portfolioHref(discipline.portfolioRoute)}">
  Портфолио <span aria-hidden="true">→</span>
</a>
```

Rename `futurePath` in `Discipline` to `portfolioRoute` and store the four `PortfolioRoute` values.

- [ ] **Step 4: Run focused and full checks**

Run:

```bash
npm test -- tests/booking.test.ts tests/page-structure.test.ts
npm test
npm run build
git diff --check
```

Expected: 0 failing tests, successful build, and no whitespace errors.

- [ ] **Step 5: Browser-check all routes**

Open the home page at 1280 px and 390 px widths. Verify every portfolio link opens the matching page, every page has no horizontal overflow, and every CTA returns to `#booking` with the correct selected service.

- [ ] **Step 6: Commit the complete foundation**

```bash
git add src/main.ts src/content.ts src/lib/booking.ts tests/booking.test.ts tests/page-structure.test.ts
git commit -m "Connect portfolio pages to booking"
```
