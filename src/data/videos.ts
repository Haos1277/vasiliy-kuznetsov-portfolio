export type VideoCategory = 'concert' | 'individual';

type VideoWorkBase<Category extends string> = {
  id: string;
  title: string;
  category: Category;
  year?: number;
  duration?: string;
};

export type VideoWork<Category extends string = string> = VideoWorkBase<Category> & (
  | {
      youtubeId: string;
      src?: never;
      poster?: string;
    }
  | {
      youtubeId?: never;
      src: string;
      poster?: string;
    }
);

export const videoWorks: readonly VideoWork<VideoCategory>[] = [];
export const aiVideoWorks: readonly VideoWork<'ai'>[] = [];
