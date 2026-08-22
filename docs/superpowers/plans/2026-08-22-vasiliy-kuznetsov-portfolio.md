# Vasiliy Kuznetsov Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, verify, and publish a responsive animated portfolio for Vasiliy Kuznetsov at `Haos1277/vasiliy-kuznetsov-portfolio` with an audio-enabled hero, four creative disciplines, and a Telegram booking flow.

**Architecture:** Use a framework-free Vite + TypeScript static site so the first version stays fast and GitHub Pages-compatible while retaining modular interaction code. Semantic HTML owns the content structure, focused TypeScript modules own navigation, reveal motion, audio, and booking, and layered CSS files own visual tokens, layout, components, and reduced-motion behavior. The generated `dist/` directory is deployed by GitHub Actions under the repository subpath.

**Tech Stack:** Vite, TypeScript, semantic HTML5, CSS, Vitest with jsdom, native IntersectionObserver and Web Audio/HTMLMediaElement APIs, GitHub Pages Actions.

**Spec:** `docs/superpowers/specs/2026-08-22-vasiliy-kuznetsov-portfolio-design.md`

## Global Constraints

- Repository: public `Haos1277/vasiliy-kuznetsov-portfolio`; do not modify `Haos1277/business-card`.
- Deployment base path: `/vasiliy-kuznetsov-portfolio/`.
- Typography: Oswald 400 for large headings, Oswald 500 only for small accents, Montserrat 400 for body copy, Montserrat 500 for navigation and buttons.
- Palette: graphite base, milk-white text, amber live-media accents, cool blue/cyan video and AI accents.
- Audio never starts with sound automatically; the visitor must explicitly enable it.
- Geography is omitted from the first version.
- Portfolio detail pages, accounts, payments, persistent data, and a live calendar are excluded.
- Motion must respect `prefers-reduced-motion: reduce`.
- All source images are optimized before being committed; originals on Desktop and Downloads remain unchanged.
- The final site must work at 360 px and 1280 px widths without horizontal overflow.

## File Structure

```text
.
├── .github/workflows/deploy-pages.yml   # build and GitHub Pages deployment
├── .gitignore                           # local/build exclusions
├── index.html                           # semantic one-page document
├── package.json                         # scripts and locked dependencies
├── package-lock.json                    # reproducible dependency graph
├── tsconfig.json                        # strict TypeScript configuration
├── vite.config.ts                       # GitHub Pages base path and build settings
├── public/
│   ├── favicon.svg                      # minimal VK/DJ mark
│   └── media/
│       ├── about.webp
│       ├── ai-creator.webp
│       ├── hero-poster.webp
│       ├── hero.mp4
│       ├── music.webp
│       ├── photographer.webp
│       └── videographer.webp
├── src/
│   ├── main.ts                          # application bootstrap only
│   ├── content.ts                       # typed site copy, links, and disciplines
│   ├── lib/
│   │   ├── audio-controller.ts          # hero audio state
│   │   ├── booking.ts                   # Telegram draft creation
│   │   ├── navigation.ts                # sticky header and mobile menu
│   │   └── reveal.ts                    # viewport reveal and reduced motion
│   └── styles/
│       ├── tokens.css                   # colors, fonts, spacing, easing
│       ├── base.css                     # reset, typography, accessibility
│       ├── layout.css                   # page and responsive composition
│       ├── components.css               # header, hero, disciplines, form, footer
│       └── motion.css                   # reveal, hover, parallax, reduced motion
└── tests/
    ├── audio-controller.test.ts
    ├── booking.test.ts
    ├── content.test.ts
    ├── navigation.test.ts
    └── reveal.test.ts
```

---

### Task 1: Project foundation and typed content

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `.gitignore`
- Create: `index.html`
- Create: `src/content.ts`
- Create: `src/main.ts`
- Create: `tests/content.test.ts`

**Interfaces:**
- Produces: `type DisciplineId = "photography" | "video" | "ai" | "music"`
- Produces: `type Discipline = { id: DisciplineId; title: string; description: string; image: string }`
- Produces: `siteContent` with identity, about copy, social URLs, and four disciplines.
- Later tasks consume element IDs defined in the minimal `index.html`: `site-header`, `menu-toggle`, `site-nav`, `hero-media`, `audio-toggle`, and `booking-form`.

- [ ] **Step 1: Initialize the package and install the development dependencies**

Run:

```bash
npm init -y
npm install --save-dev vite typescript vitest jsdom @types/node
```

Edit `package.json` so the scripts are exactly:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: Write the failing content contract test**

Create `tests/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { siteContent } from "../src/content";

describe("siteContent", () => {
  it("contains all four disciplines in the agreed order", () => {
    expect(siteContent.disciplines.map((item) => item.id)).toEqual([
      "photography",
      "video",
      "ai",
      "music",
    ]);
  });

  it("contains the approved identity and Telegram destination", () => {
    expect(siteContent.name).toBe("Василий Кузнецов");
    expect(siteContent.telegramUsername).toBe("wasiliy12777");
    expect(siteContent.roles).toContain("DJ_Schmied");
  });
});
```

- [ ] **Step 3: Run the test and verify it fails**

Run: `npm test -- tests/content.test.ts`

Expected: FAIL because `src/content.ts` does not exist.

- [ ] **Step 4: Implement the typed content model**

Create `src/content.ts` with the exact approved copy from the spec and this shape:

```ts
export type DisciplineId = "photography" | "video" | "ai" | "music";

export type Discipline = {
  id: DisciplineId;
  title: string;
  description: string;
  image: string;
};

export const siteContent = {
  name: "Василий Кузнецов",
  roles: "Фотограф · Видеограф · AI-креатор · DJ_Schmied",
  heroCopy:
    "Создаю визуальные истории и цифровые продукты под ключ — от идеи и съёмки до монтажа, нейросетей и авторского звука.",
  telegramUsername: "wasiliy12777",
  telegramChannel: "Kinodel_Vasiliy",
  instagramUrl: "https://www.instagram.com/vasiliy_ai",
  disciplines: [
    {
      id: "photography",
      title: "Фотограф",
      description:
        "Создаю фотографии, в которых важны не только свет и композиция, но и живое ощущение момента. Помогаю сформировать идею съёмки, подобрать визуальное направление и получить цельную серию кадров.",
      image: "media/photographer.webp",
    },
    {
      id: "video",
      title: "Видеограф",
      description:
        "Создаю видео от первой идеи до финального монтажа. Продумываю структуру, атмосферу и визуальный ритм, чтобы результат не просто показывал событие или продукт, а удерживал внимание зрителя.",
      image: "media/videographer.webp",
    },
    {
      id: "ai",
      title: "AI-креатор",
      description:
        "Использую нейросети как полноценный творческий инструмент: создаю изображения, визуальные концепции, анимацию и цифровой контент, который сложно или невозможно получить средствами обычной съёмки.",
      image: "media/ai-creator.webp",
    },
    {
      id: "music",
      title: "DJ_Schmied",
      description:
        "Музыка — ещё один способ создавать атмосферу и рассказывать истории. Под именем DJ_Schmied я работаю со звуком, музыкальными идеями и авторскими композициями.",
      image: "media/music.webp",
    },
  ] satisfies Discipline[],
} as const;
```

- [ ] **Step 5: Configure Vite and TypeScript**

Set `vite.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/vasiliy-kuznetsov-portfolio/",
  build: { target: "es2022" },
  test: { environment: "jsdom" },
});
```

Use strict TypeScript in `tsconfig.json`, exclude `dist`, and create a minimal Russian-language `index.html` containing the required IDs and `<script type="module" src="/src/main.ts"></script>`. Create `src/main.ts` as an empty bootstrap export: `export {};`.

- [ ] **Step 6: Run the foundation checks**

Run:

```bash
npm test -- tests/content.test.ts
npm run typecheck
npm run build
```

Expected: all commands exit 0 and `dist/index.html` exists.

- [ ] **Step 7: Commit the foundation**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts .gitignore index.html src/content.ts src/main.ts tests/content.test.ts
git commit -m "chore: scaffold portfolio site"
```

---

### Task 2: Optimized media set

**Files:**
- Create: `public/media/about.webp`
- Create: `public/media/photographer.webp`
- Create: `public/media/videographer.webp`
- Create: `public/media/ai-creator.webp`
- Create: `public/media/music.webp`
- Create: `public/media/hero.mp4`
- Create: `public/media/hero-poster.webp`

**Interfaces:**
- Produces stable public URLs under `${import.meta.env.BASE_URL}media/`.
- `index.html` consumes `about.webp`, `hero.mp4`, and `hero-poster.webp`.
- `siteContent.disciplines[*].image` consumes the four discipline filenames.

- [ ] **Step 1: Copy and optimize the approved images without changing the originals**

Run the following conversions from the repository root:

```bash
mkdir -p public/media
ffmpeg -y -i "/Users/vasiliy/Desktop/freepik__-__43413.png" -vf "scale='min(1600,iw)':-2" -c:v libwebp -quality 84 public/media/about.webp
ffmpeg -y -i "/Users/vasiliy/Downloads/ChatGPT Image 22 авг. 2026 г., 03_45_41.png" -vf "scale='min(1600,iw)':-2" -c:v libwebp -quality 84 public/media/photographer.webp
ffmpeg -y -i "/Users/vasiliy/Desktop/hjl.png" -vf "scale='min(1800,iw)':-2" -c:v libwebp -quality 84 public/media/videographer.webp
ffmpeg -y -i "/Users/vasiliy/Desktop/d8f61ef9-7d4a-4d0f-9ad1-43a0af673780.png" -vf "scale='min(1600,iw)':-2" -c:v libwebp -quality 84 public/media/ai-creator.webp
```

- [ ] **Step 2: Produce a publishable music image**

Use the image editing capability on `Gemini_Generated_Image_d8r4zrd8r4zrd8r4.png` to preserve Vasiliy's face and floating-panel composition while replacing every third-party artist name, track title, and cover with neutral `DJ_Schmied` visual panels that contain no invented releases. Save the approved result as `public/media/music.webp` at a maximum width of 1600 px.

Acceptance check: no readable third-party artist names, commercial album covers, watermarks, or logos remain.

- [ ] **Step 3: Install the prepared hero clip and poster**

Run:

```bash
cp outputs/dj-schmied-snippet-10s.mp4 public/media/hero.mp4
ffmpeg -y -ss 1 -i public/media/hero.mp4 -frames:v 1 -vf "scale=1080:-2" -c:v libwebp -quality 86 public/media/hero-poster.webp
```

- [ ] **Step 4: Verify media contracts**

Run:

```bash
test -s public/media/about.webp
test -s public/media/photographer.webp
test -s public/media/videographer.webp
test -s public/media/ai-creator.webp
test -s public/media/music.webp
test -s public/media/hero-poster.webp
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 public/media/hero.mp4
```

Expected: every `test` exits 0 and `ffprobe` reports `10.000000`.

- [ ] **Step 5: Commit the media set**

```bash
git add public/media
git commit -m "assets: add optimized portfolio media"
```

---

### Task 3: Semantic page and responsive visual system

**Files:**
- Modify: `index.html`
- Create: `public/favicon.svg`
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `src/styles/layout.css`
- Create: `src/styles/components.css`
- Create: `src/styles/motion.css`
- Modify: `src/main.ts`

**Interfaces:**
- Produces anchors `#about`, `#disciplines`, `#booking`, and `#contacts`.
- Produces `.reveal` elements consumed by `initReveal()` in Task 4.
- Produces `data-discipline` buttons consumed by `initBookingForm()` in Task 5.
- Produces `<video id="hero-media">` consumed by `createAudioController()` in Task 5.

- [ ] **Step 1: Replace the minimal document with the complete semantic page**

Build `index.html` in this exact section order:

```html
<header id="site-header">…navigation and Telegram CTA…</header>
<main>
  <section id="home">…identity, hero copy, hero video, controls…</section>
  <section id="about">…approved portrait and three approved paragraphs…</section>
  <section id="disciplines">…photography, video, AI, DJ_Schmied articles…</section>
  <section id="booking">…Telegram booking form…</section>
  <section id="contacts">…Telegram, channel, Instagram, closing line…</section>
</main>
<footer>…identity and current year target…</footer>
```

Requirements:

- Every image has descriptive Russian `alt` text and explicit `width`/`height` attributes.
- `hero-media` uses `autoplay muted loop playsinline preload="metadata"` and `poster="./media/hero-poster.webp"`.
- All non-hero images use `loading="lazy"` and `decoding="async"`.
- External links use `target="_blank" rel="noopener noreferrer"`.
- The booking form contains `name`, `service`, `date`, and `brief` controls with visible labels.
- The `service` options are `Фотосессия`, `Видеосъёмка`, `AI-проект`, `Музыка`, and `Другое`.

- [ ] **Step 2: Define the visual tokens**

Create `tokens.css` with these starting values:

```css
:root {
  --color-bg: #111315;
  --color-surface: #191c1f;
  --color-text: #f1eee7;
  --color-muted: #aaa79f;
  --color-amber: #d79a54;
  --color-cyan: #72b8c7;
  --color-line: rgb(241 238 231 / 16%);
  --font-display: "Oswald", sans-serif;
  --font-body: "Montserrat", sans-serif;
  --container: 1240px;
  --radius-media: 28px;
  --ease-cinematic: cubic-bezier(.22, 1, .36, 1);
}
```

Import Oswald weights 400/500 and Montserrat weights 400/500 from Google Fonts in `index.html`, including `preconnect` hints.

- [ ] **Step 3: Implement the base, layout, component, and motion CSS**

Implement:

- fluid headings with `clamp()` and Oswald 400;
- Montserrat 400 body copy with readable line length;
- desktop two-column hero and mobile stacked hero;
- alternating discipline layouts without repeated white cards;
- graphite surfaces extended by amber/cyan radial gradients sampled from the imagery;
- sticky transparent header and `.is-scrolled` surface state;
- accessible focus rings using `--color-amber`;
- mobile menu panel below 820 px;
- form controls with labels, validation state, and a full-width mobile submit button;
- no horizontal overflow at 360 px;
- `@media (prefers-reduced-motion: reduce)` that disables smooth scrolling, transitions, and transforms.

- [ ] **Step 4: Wire the stylesheet entrypoint**

Update `src/main.ts` to import the styles in this order:

```ts
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/motion.css";
```

- [ ] **Step 5: Build and inspect static output**

Run:

```bash
npm run typecheck
npm run build
rg -n "Василий Кузнецов|Обо мне|Фотограф|Видеограф|AI-креатор|DJ_Schmied|Обсудить в Telegram" dist/index.html
```

Expected: build succeeds and every phrase is present in `dist/index.html`.

- [ ] **Step 6: Commit the page and visual system**

```bash
git add index.html public/favicon.svg src/main.ts src/styles
git commit -m "feat: build responsive portfolio layout"
```

---

### Task 4: Header navigation and viewport reveals

**Files:**
- Create: `src/lib/navigation.ts`
- Create: `src/lib/reveal.ts`
- Create: `tests/navigation.test.ts`
- Create: `tests/reveal.test.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Produces: `initNavigation(doc: Document, win: Window): () => void`.
- Produces: `initReveal(doc: Document, win: Window): () => void`.
- Both functions return cleanup callbacks used by tests and future hot reload handling.

- [ ] **Step 1: Write failing navigation tests**

Test that:

```ts
expect(header.classList.contains("is-scrolled")).toBe(false);
// dispatch scroll after setting scrollY to 80
expect(header.classList.contains("is-scrolled")).toBe(true);
// click menu toggle
expect(toggle.getAttribute("aria-expanded")).toBe("true");
// click a nav anchor
expect(toggle.getAttribute("aria-expanded")).toBe("false");
```

- [ ] **Step 2: Run navigation tests and verify failure**

Run: `npm test -- tests/navigation.test.ts`

Expected: FAIL because `initNavigation` is missing.

- [ ] **Step 3: Implement navigation behavior**

In `src/lib/navigation.ts`:

```ts
export function initNavigation(doc: Document, win: Window): () => void {
  const header = doc.querySelector<HTMLElement>("#site-header");
  const toggle = doc.querySelector<HTMLButtonElement>("#menu-toggle");
  const nav = doc.querySelector<HTMLElement>("#site-nav");
  if (!header || !toggle || !nav) return () => undefined;

  const syncHeader = () => header.classList.toggle("is-scrolled", win.scrollY > 24);
  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  };
  const toggleMenu = () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };

  win.addEventListener("scroll", syncHeader, { passive: true });
  toggle.addEventListener("click", toggleMenu);
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  syncHeader();
  return () => {
    win.removeEventListener("scroll", syncHeader);
    toggle.removeEventListener("click", toggleMenu);
  };
}
```

- [ ] **Step 4: Write failing reveal tests**

Mock `matchMedia` and `IntersectionObserver`. Assert that reduced-motion users receive `.is-visible` immediately, and normal-motion elements receive `.is-visible` when the observer reports `isIntersecting: true`.

- [ ] **Step 5: Implement reveal behavior**

`initReveal()` must:

- query every `.reveal` element;
- show all immediately when `prefers-reduced-motion: reduce` matches;
- otherwise observe with `{ threshold: 0.16, rootMargin: "0px 0px -8% 0px" }`;
- add `.is-visible` only once and unobserve the element;
- return a cleanup callback that disconnects the observer.

- [ ] **Step 6: Wire and verify interactions**

Update `src/main.ts`:

```ts
import { initNavigation } from "./lib/navigation";
import { initReveal } from "./lib/reveal";

initNavigation(document, window);
initReveal(document, window);
```

Run: `npm test -- tests/navigation.test.ts tests/reveal.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit navigation and reveals**

```bash
git add src/lib/navigation.ts src/lib/reveal.ts src/main.ts tests/navigation.test.ts tests/reveal.test.ts
git commit -m "feat: add cinematic navigation and reveals"
```

---

### Task 5: Hero sound and Telegram booking

**Files:**
- Create: `src/lib/audio-controller.ts`
- Create: `src/lib/booking.ts`
- Create: `tests/audio-controller.test.ts`
- Create: `tests/booking.test.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Produces: `createAudioController(media: HTMLMediaElement, button: HTMLButtonElement): { destroy(): void }`.
- Produces: `buildTelegramUrl(input: BookingInput, username: string): string`.
- Produces: `initBookingForm(form: HTMLFormElement, username: string): () => void`.
- Consumes: `siteContent.telegramUsername` and the `data-discipline` buttons from Task 3.

- [ ] **Step 1: Write failing audio controller tests**

Cover these behaviors:

```ts
expect(media.muted).toBe(true);
expect(button.textContent).toContain("Включить звук");
// click
expect(media.muted).toBe(false);
expect(button.getAttribute("aria-pressed")).toBe("true");
// click again
expect(media.muted).toBe(true);
expect(button.getAttribute("aria-pressed")).toBe("false");
```

- [ ] **Step 2: Implement audio state**

The controller must call `media.play()` after unmuting, recover by restoring the muted state if playback rejects, update the button label, and remove its click listener in `destroy()`.

- [ ] **Step 3: Write failing Telegram URL tests**

Create `tests/booking.test.ts` with this expected decoded message:

```text
Здравствуйте, Василий!
Меня зовут Анна.
Интересует: Фотосессия.
Желаемая дата: 2026-09-15.
Задача: Портретная съёмка на улице.
```

Assert that the URL starts with `https://t.me/wasiliy12777?text=` and that `decodeURIComponent()` reproduces the exact message.

- [ ] **Step 4: Implement Telegram booking**

Use this contract:

```ts
export type BookingInput = {
  name: string;
  service: string;
  date: string;
  brief: string;
};

export function buildTelegramUrl(input: BookingInput, username: string): string {
  const message = [
    "Здравствуйте, Василий!",
    `Меня зовут ${input.name.trim()}.`,
    `Интересует: ${input.service}.`,
    `Желаемая дата: ${input.date || "обсудим отдельно"}.`,
    `Задача: ${input.brief.trim()}.`,
  ].join("\n");
  return `https://t.me/${username}?text=${encodeURIComponent(message)}`;
}
```

`initBookingForm()` must use native form validity, open the Telegram URL in a new tab only after valid submit, and never persist form values. Discipline buttons set the matching `service` value and focus the name field after scrolling to `#booking`.

- [ ] **Step 5: Wire both controllers**

In `src/main.ts`, query the required nodes, initialize the controllers only when nodes exist, and pass `siteContent.telegramUsername` to booking.

- [ ] **Step 6: Run interaction tests**

Run:

```bash
npm test -- tests/audio-controller.test.ts tests/booking.test.ts
npm run typecheck
```

Expected: all tests pass and typecheck exits 0.

- [ ] **Step 7: Commit audio and booking**

```bash
git add src/lib/audio-controller.ts src/lib/booking.ts src/main.ts tests/audio-controller.test.ts tests/booking.test.ts
git commit -m "feat: add hero audio and Telegram booking"
```

---

### Task 6: Metadata, accessibility, and production validation

**Files:**
- Modify: `index.html`
- Modify: `src/styles/base.css`
- Modify: `src/styles/components.css`
- Modify: `src/styles/motion.css`
- Modify: `public/favicon.svg`

**Interfaces:**
- Consumes all page structure and interactions.
- Produces the final `dist/` artifact accepted by the deployment workflow.

- [ ] **Step 1: Add complete site metadata**

Set:

```html
<title>Василий Кузнецов — фотограф, видеограф и AI-креатор</title>
<meta name="description" content="Василий Кузнецов создаёт визуальные истории и цифровые продукты под ключ: фотография, видео, монтаж, нейросети и музыка.">
<meta property="og:title" content="Василий Кузнецов — визуальные истории под ключ">
<meta property="og:description" content="Фотография, видео, AI и музыка — от идеи до готового результата.">
<meta property="og:type" content="website">
<meta property="og:image" content="https://haos1277.github.io/vasiliy-kuznetsov-portfolio/media/hero-poster.webp">
<meta name="twitter:card" content="summary_large_image">
```

- [ ] **Step 2: Audit keyboard and reduced-motion behavior**

Verify in markup and CSS:

- exactly one `h1`;
- heading order never skips levels;
- menu toggle has `aria-controls="site-nav"` and `aria-expanded="false"`;
- audio button has `aria-pressed="false"`;
- all form controls have linked labels;
- focus is visible on links, buttons, selects, inputs, and textarea;
- motion-reduction CSS removes parallax and reveal transforms while leaving content visible.

- [ ] **Step 3: Run automated checks**

Run:

```bash
npm test
npm run typecheck
npm run build
test -s dist/index.html
test -s dist/media/hero.mp4
```

Expected: all commands exit 0.

- [ ] **Step 4: Run local browser validation**

Start `npm run dev -- --host 127.0.0.1`, open the printed local URL, and validate these exact scenarios:

1. At desktop width 1280 px, the hero is two columns and no horizontal scrollbar exists.
2. At mobile width 360 px, the hero stacks, menu opens and closes, and the form fits the viewport.
3. Scroll makes the header compact and reveals each section once.
4. Audio starts muted, enables only after the button is pressed, and can be muted again.
5. A valid test form generates a `t.me/wasiliy12777?text=` URL containing the selected service.
6. Tab navigation reaches every interactive control with a visible focus indicator.
7. Reduced-motion emulation shows all content without entrance transforms.

- [ ] **Step 5: Commit final site validation changes**

```bash
git add index.html src/styles public/favicon.svg
git commit -m "feat: finalize accessible portfolio experience"
```

---

### Task 7: GitHub Pages workflow and publication

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes `npm run build` and the `dist/` directory.
- Produces the public GitHub Pages deployment URL.

- [ ] **Step 1: Add the GitHub Pages workflow**

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy portfolio to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - uses: actions/configure-pages@v6
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Document the project**

Create `README.md` with the project purpose, local commands `npm install`, `npm run dev`, `npm test`, and `npm run build`, media replacement filenames, and the production URL.

- [ ] **Step 3: Verify the workflow and final build locally**

Run:

```bash
npm ci
npm test
npm run build
git diff --check
```

Expected: all commands exit 0 and `git diff --check` prints nothing.

- [ ] **Step 4: Commit publication configuration**

```bash
git add .github/workflows/deploy-pages.yml README.md
git commit -m "ci: deploy portfolio to GitHub Pages"
```

- [ ] **Step 5: Create and push the repository**

Create public repository `Haos1277/vasiliy-kuznetsov-portfolio`, add it as `origin`, and push `main`. Do not reuse or overwrite `Haos1277/business-card`.

Expected repository URL: `https://github.com/Haos1277/vasiliy-kuznetsov-portfolio`.

- [ ] **Step 6: Enable and verify GitHub Pages**

Set Pages source to GitHub Actions, wait for the deployment workflow to complete, then verify:

- production URL returns a successful page;
- hero video and every WebP load under the repository base path;
- Telegram, Telegram channel, and Instagram links are correct;
- no console error blocks interaction.

Expected production URL: `https://haos1277.github.io/vasiliy-kuznetsov-portfolio/`.

- [ ] **Step 7: Record the published state**

Update `README.md` only if GitHub reports a different canonical Pages URL, then commit and push that single correction. Otherwise make no additional publication commit.
