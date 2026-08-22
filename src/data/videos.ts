export type VideoCategory = 'concert' | 'individual';

export type VideoWork<Category extends string = string> = {
  id: string;
  youtubeId: string;
  title: string;
  category: Category;
  year?: number;
  duration?: string;
};

export const videoWorks: readonly VideoWork<VideoCategory>[] = [];
export const aiVideoWorks: readonly VideoWork<'ai'>[] = [];
