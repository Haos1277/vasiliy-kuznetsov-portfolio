import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { aiModeCardImages, aiPhotoCollection, aiPhotos } from '../src/data/ai';
import { aiVideoWorks } from '../src/data/videos';

const projectRoot = process.cwd();

const readWebpDimensions = (filePath: string): { width: number; height: number } => {
  const bytes = readFileSync(filePath);

  expect(bytes.subarray(0, 4).toString('ascii')).toBe('RIFF');
  expect(bytes.subarray(8, 12).toString('ascii')).toBe('WEBP');

  const chunk = bytes.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8X') {
    return {
      width: bytes.readUIntLE(24, 3) + 1,
      height: bytes.readUIntLE(27, 3) + 1,
    };
  }

  if (chunk === 'VP8 ') {
    return {
      width: bytes.readUInt16LE(26) & 0x3fff,
      height: bytes.readUInt16LE(28) & 0x3fff,
    };
  }

  if (chunk === 'VP8L') {
    const packed = bytes.readUInt32LE(21);
    return {
      width: (packed & 0x3fff) + 1,
      height: ((packed >>> 14) & 0x3fff) + 1,
    };
  }

  throw new TypeError(`Unsupported WebP chunk: ${chunk}`);
};

describe('AI portfolio data', () => {
  it('keeps the unprovided AI galleries and videos truthfully empty', () => {
    expect(aiPhotos).toEqual([]);
    expect(aiPhotoCollection.items).toEqual([]);
    expect(aiVideoWorks).toEqual([]);
  });

  it('references two existing 4:5 AI mode-card assets through the base path', () => {
    const cards = Object.values(aiModeCardImages);
    expect(cards).toHaveLength(2);

    for (const card of cards) {
      const relativePath = card.replace('/vasiliy-kuznetsov-portfolio/', '');
      const filePath = resolve(projectRoot, 'public', relativePath);
      expect(existsSync(filePath)).toBe(true);

      const { width, height } = readWebpDimensions(filePath);
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      expect(width * 5).toBe(height * 4);
    }
  });
});
