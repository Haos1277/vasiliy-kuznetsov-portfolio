export type PortfolioRoute = 'photography' | 'video' | 'ai' | 'music';

export const withBase = (path: string): string => {
  const cleanPath = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};

export const portfolioHref = (route: PortfolioRoute): string =>
  withBase(`${route}/`);
