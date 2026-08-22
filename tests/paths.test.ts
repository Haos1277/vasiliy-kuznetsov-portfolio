import { describe, expect, it } from 'vitest';
import { portfolioHref, withBase } from '../src/lib/paths';

describe('portfolio paths', () => {
  it('keeps assets and pages under the configured base path', () => {
    expect(withBase('media/photo.webp')).toBe(
      '/vasiliy-kuznetsov-portfolio/media/photo.webp',
    );
    expect(portfolioHref('photography')).toBe(
      '/vasiliy-kuznetsov-portfolio/photography/',
    );
  });
});
