import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import { aiVideoWorks, videoWorks } from '../src/data/videos';

const releaseBase =
  'https://github.com/Haos1277/vasiliy-kuznetsov-portfolio/releases/download/portfolio-media-2026-10/';

const posterPath = (poster: string): string =>
  resolve(
    'public',
    poster.replace('/vasiliy-kuznetsov-portfolio/', ''),
  );

describe('video portfolio data', () => {
  it('publishes every supplied conventional and AI video', () => {
    expect(videoWorks).toHaveLength(23);
    expect(aiVideoWorks).toHaveLength(15);
    expect(videoWorks.every(({ category }) => ['concert', 'individual'].includes(category))).toBe(true);
    expect(aiVideoWorks.every(({ category }) => category === 'ai')).toBe(true);
  });

  it('uses unique release assets, existing posters, and display durations', () => {
    const works = [...videoWorks, ...aiVideoWorks];
    expect(new Set(works.map(({ id }) => id)).size).toBe(works.length);

    for (const work of works) {
      expect('src' in work ? work.src : undefined).toMatch(new RegExp(`^${releaseBase}`));
      expect(work.duration).toMatch(/^\d{2}:\d{2}$/);
      expect(work.poster).toMatch(/^\/vasiliy-kuznetsov-portfolio\/media\//);
      expect(existsSync(posterPath(work.poster!))).toBe(true);
    }
  });
});
