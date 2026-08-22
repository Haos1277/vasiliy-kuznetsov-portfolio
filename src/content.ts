import type { PortfolioRoute } from './lib/paths';

export type DisciplineId =
  | 'photographer'
  | 'videographer'
  | 'ai-creator'
  | 'music';

export interface Discipline {
  id: DisciplineId;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  service: string;
  portfolioRoute: PortfolioRoute;
}

export const profile = {
  name: 'Василий Кузнецов',
  roles: ['Фотограф', 'Видеограф', 'AI-креатор', 'DJ_Schmied'],
  heroText:
    'Создаю визуальные истории и цифровые продукты под ключ — от идеи и съёмки до монтажа, нейросетей и авторского звука.',
  about: [
    'Работаю на пересечении фотографии, видео, искусственного интеллекта и музыки. Для меня это не отдельные инструменты, а части одного творческого процесса.',
    'Я могу подключиться к конкретной задаче или собрать проект целиком: разработать визуальную идею, провести съёмку, смонтировать материал, дополнить его AI-графикой и подобрать звуковое решение.',
    'Главное для меня — не просто создать красивую картинку, а передать настроение, характер и историю.',
  ],
} as const;

export const contactLinks = {
  telegram: 'https://t.me/wasiliy12777',
  channel: 'https://t.me/Kinodel_Vasiliy',
  instagram: 'https://www.instagram.com/vasiliy_ai',
} as const;

export const disciplines: readonly Discipline[] = [
  {
    id: 'photographer',
    eyebrow: '01 / Свет и момент',
    title: 'Фотограф',
    description:
      'Создаю фотографии, в которых важны не только свет и композиция, но и живое ощущение момента. Помогаю сформировать идею съёмки, подобрать визуальное направление и получить цельную серию кадров.',
    image: 'media/photographer.webp',
    imageAlt: 'Василий Кузнецов с фотокамерой на берегу моря',
    service: 'Фотосессия',
    portfolioRoute: 'photography',
  },
  {
    id: 'videographer',
    eyebrow: '02 / История в движении',
    title: 'Видеограф',
    description:
      'Создаю видео от первой идеи до финального монтажа. Продумываю структуру, атмосферу и визуальный ритм, чтобы результат не просто показывал событие или продукт, а удерживал внимание зрителя.',
    image: 'media/videographer.webp',
    imageAlt: 'Василий Кузнецов в режиссёрском кресле среди студийного света',
    service: 'Видеосъёмка',
    portfolioRoute: 'video',
  },
  {
    id: 'ai-creator',
    eyebrow: '03 / Новая реальность',
    title: 'AI-креатор',
    description:
      'Использую нейросети как полноценный творческий инструмент: создаю изображения, визуальные концепции, анимацию и цифровой контент, который сложно или невозможно получить средствами обычной съёмки.',
    image: 'media/ai-creator.webp',
    imageAlt: 'Василий Кузнецов и человекоподобный робот работают вместе',
    service: 'AI-проект',
    portfolioRoute: 'ai',
  },
  {
    id: 'music',
    eyebrow: '04 / Авторский звук',
    title: 'DJ_Schmied',
    description:
      'Музыка — ещё один способ создавать атмосферу и рассказывать истории. Под именем DJ_Schmied я работаю со звуком, музыкальными идеями и авторскими композициями.',
    image: 'media/music.webp',
    imageAlt: 'Портрет DJ_Schmied в окружении абстрактных музыкальных панелей',
    service: 'Музыка',
    portfolioRoute: 'music',
  },
];
