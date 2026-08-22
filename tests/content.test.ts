import { describe, expect, it } from 'vitest';

import { contactLinks, disciplines, profile } from '../src/content';

describe('portfolio content', () => {
  it('keeps the approved identity and positioning', () => {
    expect(profile.name).toBe('Василий Кузнецов');
    expect(profile.roles).toEqual([
      'Фотограф',
      'Видеограф',
      'AI-креатор',
      'DJ_Schmied',
    ]);
    expect(profile.heroText).toContain('визуальные истории');
  });

  it('defines all four disciplines in the intended order', () => {
    expect(disciplines.map(({ id }) => id)).toEqual([
      'photographer',
      'videographer',
      'ai-creator',
      'music',
    ]);
  });

  it('uses clean public contact URLs', () => {
    expect(contactLinks.telegram).toBe('https://t.me/wasiliy12777');
    expect(contactLinks.channel).toBe('https://t.me/Kinodel_Vasiliy');
    expect(contactLinks.instagram).toBe('https://www.instagram.com/vasiliy_ai');
  });
});
