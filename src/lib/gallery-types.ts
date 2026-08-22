export type GalleryItem = {
  id: string;
  thumbnail: string;
  full: string;
  alt: string;
  width: number;
  height: number;
};

export type GalleryCollection<Id extends string> = {
  id: Id;
  title: string;
  cardImage: string;
  items: readonly GalleryItem[];
};
