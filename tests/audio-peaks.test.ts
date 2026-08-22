import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const script = resolve('scripts/audio-peaks.mjs');
const track = resolve('public/media/dj-schmied-storm.mp3');

describe('audio peak extraction CLI', () => {
  it('prints 192 normalized peaks for the supplied MP3', () => {
    const result = spawnSync(process.execPath, [script, track, '192'], {
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    const peaks: unknown = JSON.parse(result.stdout);
    expect(Array.isArray(peaks)).toBe(true);
    if (!Array.isArray(peaks)) {
      throw new Error('Expected the CLI to print a JSON array.');
    }
    expect(peaks).toHaveLength(192);
    expect(peaks.every((peak) => typeof peak === 'number' && peak >= 0 && peak <= 1)).toBe(
      true,
    );
  });

  it('rejects a non-positive bucket count', () => {
    const result = spawnSync(process.execPath, [script, track, '0'], {
      encoding: 'utf8',
    });

    expect(result.status).not.toBe(0);
    expect(result.stdout).toBe('');
  });
});
