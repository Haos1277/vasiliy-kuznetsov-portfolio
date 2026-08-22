const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;

export const isYouTubeId = (value: string): boolean =>
  youtubeIdPattern.test(value);

export const youtubeWatchUrl = (id: string): string => {
  if (!isYouTubeId(id)) throw new TypeError('Invalid YouTube video ID');
  return `https://www.youtube.com/watch?v=${id}`;
};

export const youtubeEmbedUrl = (id: string, autoplay = false): string => {
  if (!isYouTubeId(id)) throw new TypeError('Invalid YouTube video ID');
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplay ? '1' : '0'}&rel=0`;
};
