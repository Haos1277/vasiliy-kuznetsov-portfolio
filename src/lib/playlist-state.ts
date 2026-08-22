export type RepeatMode = 'off' | 'all' | 'one';

export type PlaylistState = {
  index: number;
  playing: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
};

const isValidLength = (length: number): boolean =>
  Number.isSafeInteger(length) && length > 0;

const isValidIndex = (index: number, length: number): boolean =>
  isValidLength(length) && Number.isSafeInteger(index) && index >= 0 && index < length;

const stopPlayback = (state: PlaylistState): PlaylistState =>
  state.playing ? { ...state, playing: false } : state;

export const createPlaylistState = (): PlaylistState => ({
  index: 0,
  playing: false,
  shuffle: false,
  repeat: 'off',
});

export const selectTrack = (
  state: PlaylistState,
  index: number,
  length: number,
): PlaylistState => {
  if (!isValidIndex(index, length)) return state;

  return { ...state, index, playing: true };
};

export const nextTrack = (
  state: PlaylistState,
  length: number,
  random: () => number,
): PlaylistState => {
  if (!isValidIndex(state.index, length)) return state;
  if (state.repeat === 'one') return state;

  if (length === 1) {
    return state.repeat === 'all' ? state : stopPlayback(state);
  }

  if (state.shuffle) {
    const randomIndex = Math.floor(random() * length);
    const index = Number.isNaN(randomIndex)
      ? 0
      : Math.min(length - 1, Math.max(0, randomIndex));

    return index === state.index ? state : { ...state, index };
  }

  if (state.index < length - 1) return { ...state, index: state.index + 1 };
  if (state.repeat === 'all') return { ...state, index: 0 };

  return stopPlayback(state);
};

export const previousTrack = (state: PlaylistState, length: number): PlaylistState => {
  if (!isValidIndex(state.index, length) || length === 1) return state;
  if (state.index > 0) return { ...state, index: state.index - 1 };
  if (state.repeat === 'all') return { ...state, index: length - 1 };

  return state;
};

export const cycleRepeat = (state: PlaylistState): PlaylistState => ({
  ...state,
  repeat: state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off',
});

export const toggleShuffle = (state: PlaylistState): PlaylistState => ({
  ...state,
  shuffle: !state.shuffle,
});
