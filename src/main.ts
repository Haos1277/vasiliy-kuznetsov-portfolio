import { contactLinks, disciplines, profile } from './content';
import { initAudioController } from './lib/audio-controller';
import { initBookingForm } from './lib/booking';
import { initNavigation } from './lib/navigation';
import { initReveal } from './lib/reveal';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/motion.css';

const base = import.meta.env.BASE_URL;
const media = (path: string) => `${base}${path}`;

const disciplinesMarkup = disciplines
  .map(
    (discipline, index) => `
      <article class="discipline discipline--${discipline.id} ${index % 2 ? 'discipline--reverse' : ''}" data-reveal>
        <div class="discipline__media reveal-item">
          <span class="discipline__number" aria-hidden="true">0${index + 1}</span>
          <img src="${media(discipline.image)}" alt="${discipline.imageAlt}" loading="lazy" width="1200" height="1500" />
        </div>
        <div class="discipline__copy reveal-item">
          <p class="eyebrow">${discipline.eyebrow}</p>
          <h3>${discipline.title}</h3>
          <p>${discipline.description}</p>
          <div class="discipline__actions">
            <button class="text-link" type="button" data-book-service="${discipline.service}">
              Обсудить проект <span aria-hidden="true">↗</span>
            </button>
            <button class="text-link text-link--placeholder" type="button" disabled title="Раздел появится на следующем этапе">
              Портфолио <small>скоро</small>
            </button>
          </div>
        </div>
      </article>
    `,
  )
  .join('');

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <a class="skip-link" href="#main">Перейти к содержанию</a>
  <audio
    data-site-audio
    preload="none"
    src="${media('media/dj-schmied-storm.mp3')}"
    aria-label="DJ_Schmied — A storm covers the sky with darkness"
  ></audio>

  <header class="site-header" data-site-header>
    <a class="brand" href="#top" aria-label="На главную">
      <span>Василий Кузнецов</span>
      <small>DJ_Schmied</small>
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" data-menu-toggle>
      <span>Меню</span><i aria-hidden="true"></i>
    </button>
    <nav class="site-nav" id="site-navigation" aria-label="Основная навигация" data-site-nav>
      <a href="#about">Обо мне</a>
      <a href="#directions">Направления</a>
      <a href="#music">Музыка</a>
      <a href="#contacts">Контакты</a>
    </nav>
    <a class="header-cta" href="#booking">Обсудить проект</a>
  </header>

  <main id="main">
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="ambient ambient--amber" aria-hidden="true"></div>
      <div class="ambient ambient--blue" aria-hidden="true"></div>
      <div class="hero__visual" data-hero-visual>
        <div class="hero__frame">
          <video
            data-hero-video
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            poster="${media('media/hero-poster.webp')}"
            aria-label="Авторский музыкальный видеофрагмент DJ_Schmied"
          >
            <source src="${media('media/hero.mp4')}" type="video/mp4" />
          </video>
          <span class="hero__frame-label">Visual / Sound / 2026</span>
        </div>
      </div>
      <div class="hero__copy">
        <p class="hero__roles">${profile.roles.join(' <span>·</span> ')}</p>
        <h1 id="hero-title">${profile.name}</h1>
        <p class="hero__lead">${profile.heroText}</p>
        <div class="hero__actions">
          <a class="button button--primary" href="#directions">Смотреть направления</a>
          <button class="button button--ghost" type="button" data-audio-toggle aria-pressed="false">Включить звук</button>
        </div>
      </div>
      <a class="scroll-cue" href="#about"><span>Листайте</span><i aria-hidden="true"></i></a>
    </section>

    <section class="section about" id="about" aria-labelledby="about-title" data-reveal>
      <div class="section-index">01</div>
      <div class="about__media reveal-item">
        <div class="about__portrait">
          <img src="${media('media/about.webp')}" alt="Портрет Василия Кузнецова" loading="lazy" width="1080" height="1920" />
        </div>
      </div>
      <div class="about__copy reveal-item">
        <p class="eyebrow">Обо мне</p>
        <h2 id="about-title">Один автор.<br /><span>Четыре языка.</span></h2>
        ${profile.about.map((paragraph) => `<p>${paragraph}</p>`).join('')}
      </div>
    </section>

    <section class="directions" id="directions" aria-labelledby="directions-title">
      <header class="section-heading" data-reveal>
        <div class="section-index">02</div>
        <p class="eyebrow">Направления</p>
        <h2 id="directions-title">От первого кадра<br />до финального <span>звука</span></h2>
      </header>
      <hr class="directions__divider" aria-hidden="true" />
      <div class="disciplines">${disciplinesMarkup}</div>
    </section>

    <section class="sound-section" id="music" aria-labelledby="sound-title" data-reveal>
      <div class="sound-section__grid" aria-hidden="true">
        ${Array.from({ length: 28 }, (_, index) => `<i style="--bar:${(index * 7) % 17 + 5}"></i>`).join('')}
      </div>
      <div class="sound-section__copy reveal-item">
        <p class="eyebrow">DJ_Schmied / авторский звук</p>
        <h2 id="sound-title">У каждой истории<br />есть свой <span>ритм</span></h2>
        <p><strong>DJ_Schmied — A storm covers the sky with darkness.</strong><br />Полная версия авторского трека, под который создан видеосниппет первого экрана.</p>
        <button
          class="button button--light"
          type="button"
          data-audio-toggle
          data-audio-label-off="Включить музыку"
          data-audio-label-on="Остановить музыку"
          aria-pressed="false"
        >Включить музыку</button>
      </div>
    </section>

    <section class="booking section" id="booking" aria-labelledby="booking-title" data-reveal>
      <div class="booking__intro reveal-item">
        <div class="section-index">03</div>
        <p class="eyebrow">Новый проект</p>
        <h2 id="booking-title">Есть идея, которую хочется <span>воплотить?</span></h2>
        <p>Расскажите о задаче — фотосессии, видеосъёмке, AI-проекте или музыкальном оформлении. Обсудим формат и найдём подходящее решение.</p>
      </div>
      <form class="booking-form reveal-item" data-booking-form>
        <label>
          <span>Ваше имя</span>
          <input name="name" type="text" autocomplete="name" placeholder="Как к вам обращаться" required />
        </label>
        <label>
          <span>Направление</span>
          <select name="service" required>
            <option value="">Выберите услугу</option>
            <option>Фотосессия</option>
            <option>Видеосъёмка</option>
            <option>AI-проект</option>
            <option>Музыка</option>
            <option>Другое</option>
          </select>
        </label>
        <label>
          <span>Желаемая дата</span>
          <input name="date" type="date" />
        </label>
        <label class="booking-form__wide">
          <span>Коротко о задаче</span>
          <textarea name="brief" rows="4" placeholder="Что вы хотите создать?" required></textarea>
        </label>
        <button class="button button--primary booking-form__wide" type="submit">Обсудить в Telegram <span aria-hidden="true">↗</span></button>
        <p class="form-note booking-form__wide">Сообщение откроется в Telegram — вы сможете проверить его перед отправкой.</p>
      </form>
    </section>
  </main>

  <footer class="site-footer" id="contacts">
    <div class="site-footer__statement" data-reveal>
      <p>Давайте создавать то, что хочется</p>
      <h2>пересматривать,<br /><span>переслушивать</span><br />и сохранять.</h2>
    </div>
    <div class="site-footer__links">
      <a href="${contactLinks.telegram}" target="_blank" rel="noreferrer">Telegram <span>@wasiliy12777</span></a>
      <a href="${contactLinks.channel}" target="_blank" rel="noreferrer">Канал <span>Kinodel_Vasiliy</span></a>
      <a href="${contactLinks.instagram}" target="_blank" rel="noreferrer">Instagram <span>@vasiliy_ai</span></a>
    </div>
    <div class="site-footer__meta">
      <span>Василий Кузнецов · DJ_Schmied</span>
      <span>© 2026</span>
    </div>
  </footer>
`;

initNavigation();
initReveal();
initAudioController();
initBookingForm();

const heroVisual = document.querySelector<HTMLElement>('[data-hero-visual]');
if (heroVisual && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener(
    'pointermove',
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 8;
      const y = (event.clientY / window.innerHeight - 0.5) * 8;
      heroVisual.style.setProperty('--parallax-x', `${x}px`);
      heroVisual.style.setProperty('--parallax-y', `${y}px`);
    },
    { passive: true },
  );
}
