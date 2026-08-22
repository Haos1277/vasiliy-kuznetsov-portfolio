export type GalleryState<Id extends string> = {
  activeCategory: Id;
  indexByCategory: Record<Id, number>;
  lightboxOpen: boolean;
};

export const createGalleryState = <
  const Ids extends readonly [string, ...string[]],
>(
  ids: Ids,
  initialCategory: NoInfer<Ids[number]> = ids[0],
): GalleryState<Ids[number]> => ({
  activeCategory: initialCategory,
  indexByCategory: Object.fromEntries(ids.map((id) => [id, 0])) as Record<
    Ids[number],
    number
  >,
  lightboxOpen: false,
});

export const selectCategory = <Id extends string>(
  state: GalleryState<Id>,
  activeCategory: Id,
): GalleryState<Id> => ({
  ...state,
  activeCategory,
  lightboxOpen: false,
});

export const moveFrame = <Id extends string>(
  state: GalleryState<Id>,
  direction: -1 | 1,
  length: number,
): GalleryState<Id> => {
  if (length === 0) return state;

  const currentIndex = state.indexByCategory[state.activeCategory];
  const nextIndex = (currentIndex + direction + length) % length;

  return {
    ...state,
    indexByCategory: {
      ...state.indexByCategory,
      [state.activeCategory]: nextIndex,
    },
  };
};

export const openLightbox = <Id extends string>(
  state: GalleryState<Id>,
): GalleryState<Id> => ({ ...state, lightboxOpen: true });

export const closeLightbox = <Id extends string>(
  state: GalleryState<Id>,
): GalleryState<Id> => ({ ...state, lightboxOpen: false });
