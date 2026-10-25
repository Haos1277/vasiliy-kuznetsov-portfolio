import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import { musicTracks } from '../src/data/music';

describe('music data', () => {
  it('publishes every supplied track under the DJ Schmied artist', () => {
    expect(musicTracks).toHaveLength(12);
    expect(musicTracks.every(({ artist }) => artist === 'DJ_Schmied')).toBe(true);
    expect(musicTracks.map(({ title }) => title)).toEqual([
      'A storm covers the sky with darkness',
      'Gray at Dawn',
      'Код написан',
      'Алиса, смелее мечтай',
      'Гори',
      'Зима',
      'Не всё подвластно',
      'Поздравление мужа',
      'Последний спектакль',
      'Темно... Холодно... Они здесь.',
      'Я бабуля',
      'Родной огонёк (Remastered)',
    ]);
  });

  it('stores an existing source and normalized waveform peaks for every real track', () => {
    for (const track of musicTracks) {
      expect(existsSync(resolve('public', track.src))).toBe(true);
      expect(track.peaks.length).toBe(192);
      expect(track.peaks.every((peak) => peak >= 0 && peak <= 1)).toBe(true);
      expect(track.duration).toBeGreaterThan(0);
    }
  });
});
