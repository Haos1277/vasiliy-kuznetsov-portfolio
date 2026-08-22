import { describe, expect, it } from 'vitest';
import { musicTracks } from '../src/data/music';

describe('music data', () => {
  it('uses one artist and never exceeds the approved first-version limit', () => {
    expect(musicTracks.length).toBeLessThanOrEqual(15);
    expect(musicTracks.every(({ artist }) => artist === 'DJ_Schmied')).toBe(true);
  });

  it('stores normalized waveform peaks for every real track', () => {
    for (const track of musicTracks) {
      expect(track.peaks.length).toBe(192);
      expect(track.peaks.every((peak) => peak >= 0 && peak <= 1)).toBe(true);
      expect(track.duration).toBeGreaterThan(0);
    }
  });
});
