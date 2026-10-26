import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { portfolioHref, withBase } from '../src/lib/paths';

describe('portfolio paths', () => {
  it('serves assets and pages from the GitHub user-site root', () => {
    expect(withBase('media/photo.webp')).toBe('/media/photo.webp');
    expect(portfolioHref('photography')).toBe('/photography/');
  });

  it('keeps route favicons under the configured base path', async () => {
    const routeEntries = ['photography', 'video', 'ai', 'music'];

    const htmlFiles = await Promise.all(
      routeEntries.map((route) =>
        readFile(resolve(process.cwd(), route, 'index.html'), 'utf8'),
      ),
    );

    for (const html of htmlFiles) {
      expect(html).toContain('href="%BASE_URL%favicon.svg"');
    }
  });
});
