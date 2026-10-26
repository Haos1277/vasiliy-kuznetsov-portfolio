import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import {
  photographyCategories,
  type PhotoCategory,
} from '../src/data/photography';

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

describe('photography data', () => {
  it('keeps the supplied collections in order and adds Nha Trang', () => {
    expect(photographyCategories.map(({ id }) => id)).toEqual([
      'studio',
      'wedding',
      'product',
      'concert',
      'nha-trang',
    ]);
  });

  it('uses Russian titles and matches every supplied category count', () => {
    expect(photographyCategories.map(({ title }) => title)).toEqual([
      'Студийная съёмка',
      'Свадебная съёмка',
      'Предметная съёмка',
      'Концертная съёмка',
      'Нячанг',
    ]);
    expect(photographyCategories.map(({ items }) => items.length)).toEqual([21, 45, 0, 0, 23]);
  });

  it('keeps media paths under the configured base and category folders', () => {
    expect(photographyCategories.map(({ cardImage }) => cardImage)).toEqual([
      '/media/photography/cards/studio.webp',
      '/media/photography/cards/wedding.webp',
      '/media/photography/cards/product.webp',
      '/media/photography/cards/concert.webp',
      '/media/photography/nha-trang/thumb/dscf0715.webp',
    ]);

    const categories: readonly PhotoCategory[] = photographyCategories;
    for (const category of categories) {
      for (const item of category.items) {
        expect(item.thumbnail).toContain(`/photography/${category.id}/`);
        expect(item.full).toContain(`/photography/${category.id}/`);
        const thumbnailPath = resolve(
          projectRoot,
          'public',
          item.thumbnail.replace(/^\//, ''),
        );
        const fullPath = resolve(
          projectRoot,
          'public',
          item.full.replace(/^\//, ''),
        );
        expect(existsSync(thumbnailPath)).toBe(true);
        expect(existsSync(fullPath)).toBe(true);
        expect(readWebpDimensions(fullPath)).toEqual({ width: item.width, height: item.height });
      }
    }
  });
});
