import { describe, expect, it } from 'vitest';

import {
  isYouTubeId,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from '../src/lib/youtube';

describe('YouTube URLs', () => {
  it('accepts only an eleven-character video ID', () => {
    expect(isYouTubeId('dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeId('Ab_cD-12345')).toBe(true);
    expect(isYouTubeId('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false);
    expect(isYouTubeId('bad id')).toBe(false);
    expect(isYouTubeId('dQw4w9WgXc')).toBe(false);
    expect(isYouTubeId('dQw4w9WgXcQQ')).toBe(false);
  });

  it('uses privacy-enhanced embeds and explicit autoplay', () => {
    expect(youtubeEmbedUrl('dQw4w9WgXcQ', true)).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
    );
    expect(youtubeEmbedUrl('dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0',
    );
    expect(youtubeWatchUrl('dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
  });

  it('rejects malformed IDs when building YouTube URLs', () => {
    expect(() => youtubeEmbedUrl('bad id')).toThrow('Invalid YouTube video ID');
    expect(() => youtubeWatchUrl('dQw4w9WgXc')).toThrow('Invalid YouTube video ID');
  });
});
