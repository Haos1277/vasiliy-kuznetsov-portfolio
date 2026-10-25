import { withBase } from '../lib/paths';

export type VideoCategory = 'concert' | 'individual';

type VideoWorkBase<Category extends string> = {
  id: string;
  title: string;
  category: Category;
  year?: number;
  duration?: string;
};

export type VideoWork<Category extends string = string> = VideoWorkBase<Category> & (
  | {
      youtubeId: string;
      src?: never;
      poster?: string;
    }
  | {
      youtubeId?: never;
      src: string;
      poster?: string;
    }
);

export const videoWorks: readonly VideoWork<VideoCategory>[] = [
  {
    id: "franchise-school-ek",
    title: "Франшиза «Школа ЕК»",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-franchise-school-ek.mp4",
    poster: withBase("media/video/posters/franchise-school-ek.webp"),
    duration: "05:53",
  },
  {
    id: "birthday-film",
    title: "День рождения",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-birthday-film.mp4",
    poster: withBase("media/video/posters/birthday-film.webp"),
    duration: "03:50",
  },
  {
    id: "logo-video",
    title: "Logo Video",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-logo.mp4",
    poster: withBase("media/video/posters/logo-video.webp"),
    duration: "00:30",
  },
  {
    id: "gunei-ritual",
    title: "Обряд в Гунэе",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-gunei-ritual.mp4",
    poster: withBase("media/video/posters/gunei-ritual.webp"),
    duration: "03:57",
  },
  {
    id: "run",
    title: "Пробежка",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-run.mp4",
    poster: withBase("media/video/posters/run.webp"),
    duration: "00:36",
  },
  {
    id: "sixteen-nine-three",
    title: "16:9 / 03",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-16-9-03.mp4",
    poster: withBase("media/video/posters/sixteen-nine-three.webp"),
    duration: "00:33",
  },
  {
    id: "dark",
    title: "Dark",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-dark.mp4",
    poster: withBase("media/video/posters/dark.webp"),
    duration: "00:40",
  },
  {
    id: "intro-two",
    title: "Intro 2",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-intro-2.mp4",
    poster: withBase("media/video/posters/intro-two.webp"),
    duration: "00:11",
  },
  {
    id: "final",
    title: "Финал",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-final.mp4",
    poster: withBase("media/video/posters/final.webp"),
    duration: "11:54",
  },
  {
    id: "lesson-eight",
    title: "Урок 8",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-lesson-8.mp4",
    poster: withBase("media/video/posters/lesson-eight.webp"),
    duration: "00:14",
  },
  {
    id: "birthday-vertical",
    title: "День рождения — вертикальный ролик",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-birthday-vertical.mp4",
    poster: withBase("media/video/posters/birthday-vertical.webp"),
    duration: "02:20",
  },
  {
    id: "colors-miroslava",
    title: "«Краски» — Ташлыкова Мирослава",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-colors-miroslava.mp4",
    poster: withBase("media/video/posters/colors-miroslava.webp"),
    duration: "03:21",
  },
  {
    id: "buratino-intro",
    title: "Вступление «Буратино»",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-buratino-intro.mp4",
    poster: withBase("media/video/posters/buratino-intro.webp"),
    duration: "00:50",
  },
  {
    id: "img-3024",
    title: "Портретный ролик",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-img-3024.mp4",
    poster: withBase("media/video/posters/img-3024.webp"),
    duration: "00:35",
  },
  {
    id: "lesson-six",
    title: "Урок 6",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-lesson-6.mp4",
    poster: withBase("media/video/posters/lesson-six.webp"),
    duration: "00:12",
  },
  {
    id: "great-grandfather",
    title: "Прадедушка",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-great-grandfather.mp4",
    poster: withBase("media/video/posters/great-grandfather.webp"),
    duration: "02:49",
  },
  {
    id: "girl",
    title: "Девочка",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-girl.mp4",
    poster: withBase("media/video/posters/girl.webp"),
    duration: "01:08",
  },
  {
    id: "we-sing-everywhere",
    title: "Мы поём везде",
    category: "concert",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-we-sing-everywhere.mp4",
    poster: withBase("media/video/posters/we-sing-everywhere.webp"),
    duration: "04:29",
  },
  {
    id: "short-film",
    title: "Короткий ролик",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-short-film.mp4",
    poster: withBase("media/video/posters/short-film.webp"),
    duration: "01:08",
  },
  {
    id: "shamans-night",
    title: "Ночь шаманов",
    category: "concert",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-shamans-night.mp4",
    poster: withBase("media/video/posters/shamans-night.webp"),
    duration: "02:08",
  },
  {
    id: "lesson-twelve",
    title: "Урок 12",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-lesson-12.mp4",
    poster: withBase("media/video/posters/lesson-twelve.webp"),
    duration: "00:06",
  },
  {
    id: "fifty-years",
    title: "50 лет по фото",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-fifty-years.mp4",
    poster: withBase("media/video/posters/fifty-years.webp"),
    duration: "04:10",
  },
  {
    id: "solstice",
    title: "Солнцестояние",
    category: "individual",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/video-solstice.mp4",
    poster: withBase("media/video/posters/solstice.webp"),
    duration: "01:18",
  },
];

export const aiVideoWorks: readonly VideoWork<'ai'>[] = [
  {
    id: "ai-goddess",
    title: "Женщина-богиня",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-goddess.mp4",
    poster: withBase("media/ai/video-posters/ai-goddess.webp"),
    duration: "00:59",
  },
  {
    id: "ai-lena",
    title: "Лена",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-lena.mp4",
    poster: withBase("media/ai/video-posters/ai-lena.webp"),
    duration: "03:00",
  },
  {
    id: "ai-modern-ded-moroz",
    title: "Современный Дед Мороз",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-modern-ded-moroz.mp4",
    poster: withBase("media/ai/video-posters/ai-modern-ded-moroz.webp"),
    duration: "00:56",
  },
  {
    id: "ai-img-1474",
    title: "AI-портрет 1474",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-img-1474.mp4",
    poster: withBase("media/ai/video-posters/ai-img-1474.webp"),
    duration: "01:14",
  },
  {
    id: "ai-yaga",
    title: "Яга",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-yaga.mp4",
    poster: withBase("media/ai/video-posters/ai-yaga.webp"),
    duration: "00:08",
  },
  {
    id: "ai-day-one",
    title: "День первый",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-day-one.mp4",
    poster: withBase("media/ai/video-posters/ai-day-one.webp"),
    duration: "00:31",
  },
  {
    id: "ai-final-two",
    title: "Финал 2",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-final-2.mp4",
    poster: withBase("media/ai/video-posters/ai-final-two.webp"),
    duration: "05:38",
  },
  {
    id: "ai-frost",
    title: "Мороз",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-frost.mp4",
    poster: withBase("media/ai/video-posters/ai-frost.webp"),
    duration: "01:10",
  },
  {
    id: "ai-second-test",
    title: "Второй тестовый",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-second-test.mp4",
    poster: withBase("media/ai/video-posters/ai-second-test.webp"),
    duration: "00:59",
  },
  {
    id: "ai-img-1177",
    title: "AI-портрет 1177",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-img-1177.mp4",
    poster: withBase("media/ai/video-posters/ai-img-1177.webp"),
    duration: "00:28",
  },
  {
    id: "ai-snow-maiden-boss",
    title: "Снегурочка-БОСС",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-snow-maiden-boss.mp4",
    poster: withBase("media/ai/video-posters/ai-snow-maiden-boss.webp"),
    duration: "00:42",
  },
  {
    id: "ai-heart-sounds",
    title: "Звуки сердца",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-heart-sounds.mp4",
    poster: withBase("media/ai/video-posters/ai-heart-sounds.webp"),
    duration: "02:13",
  },
  {
    id: "ai-wish",
    title: "Пожелание",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-wish.mp4",
    poster: withBase("media/ai/video-posters/ai-wish.webp"),
    duration: "00:27",
  },
  {
    id: "ai-alexandra",
    title: "Александра",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-alexandra.mp4",
    poster: withBase("media/ai/video-posters/ai-alexandra.webp"),
    duration: "00:17",
  },
  {
    id: "ai-img-0201",
    title: "AI-портрет 0201",
    category: "ai",
    src: "https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/ai-img-0201.mp4",
    poster: withBase("media/ai/video-posters/ai-img-0201.webp"),
    duration: "00:32",
  },
];
