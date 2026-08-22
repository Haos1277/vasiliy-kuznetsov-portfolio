import { describe, expect, it, vi } from 'vitest';

import {
  createPlaylistState,
  cycleRepeat,
  nextTrack,
  previousTrack,
  selectTrack,
  toggleShuffle,
} from '../src/lib/playlist-state';

describe('playlist state', () => {
  it('creates a stopped, ordered playlist at its first track', () => {
    expect(createPlaylistState()).toEqual({
      index: 0,
      playing: false,
      shuffle: false,
      repeat: 'off',
    });
  });

  it('selects a valid track, starts playback, and preserves the prior state', () => {
    const state = createPlaylistState();
    const selected = selectTrack(state, 2, 3);

    expect(selected).toEqual({ ...state, index: 2, playing: true });
    expect(selected).not.toBe(state);
    expect(state).toEqual(createPlaylistState());
  });

  it('leaves the state unchanged when selection is empty or outside the playlist', () => {
    const state = { ...createPlaylistState(), index: 1, playing: true };

    expect(selectTrack(state, 0, 0)).toBe(state);
    expect(selectTrack(state, -1, 3)).toBe(state);
    expect(selectTrack(state, 3, 3)).toBe(state);
    expect(selectTrack(state, 1.5, 3)).toBe(state);
  });

  it('advances and wraps only when repeat all is active', () => {
    const base = { ...createPlaylistState(), index: 2, playing: true };

    expect(nextTrack(base, 3, () => 0)).toEqual({ ...base, playing: false });
    expect(nextTrack({ ...base, repeat: 'all' }, 3, () => 0)).toEqual({
      ...base,
      index: 0,
      repeat: 'all',
    });
  });

  it('keeps the same track for repeat one', () => {
    const state = { ...createPlaylistState(), index: 1, playing: true, repeat: 'one' as const };

    expect(nextTrack(state, 3, () => 0)).toEqual(state);
  });

  it('uses the injected random source only while shuffle is active and clamps its result', () => {
    const orderedRandom = vi.fn(() => 0.75);
    const shuffledRandom = vi.fn(() => 0.75);
    const ordered = { ...createPlaylistState(), index: 0 };
    const shuffled = { ...ordered, shuffle: true };

    expect(nextTrack(ordered, 4, orderedRandom)).toEqual({ ...ordered, index: 1 });
    expect(orderedRandom).not.toHaveBeenCalled();
    expect(nextTrack(shuffled, 4, shuffledRandom)).toEqual({ ...shuffled, index: 3 });
    expect(shuffledRandom).toHaveBeenCalledOnce();
    expect(nextTrack(shuffled, 4, () => -0.2).index).toBe(0);
    expect(nextTrack(shuffled, 4, () => 1.2).index).toBe(3);
    expect(nextTrack(shuffled, 4, () => Number.POSITIVE_INFINITY).index).toBe(3);
    expect(nextTrack(shuffled, 4, () => Number.NEGATIVE_INFINITY).index).toBe(0);
    expect(nextTrack(shuffled, 4, () => Number.NaN).index).toBe(0);
  });

  it('does not call random for empty or invalid playlists', () => {
    const random = vi.fn(() => 0.5);
    const state = { ...createPlaylistState(), shuffle: true };
    const invalid = { ...state, index: 3 };

    expect(nextTrack(state, 0, random)).toBe(state);
    expect(nextTrack(invalid, 3, random)).toBe(invalid);
    expect(random).not.toHaveBeenCalled();
  });

  it('stops at the end of a one-track playlist unless repeat is enabled', () => {
    const playing = { ...createPlaylistState(), playing: true };

    expect(nextTrack(playing, 1, () => 0.5)).toEqual({ ...playing, playing: false });
    expect(nextTrack({ ...playing, repeat: 'all' }, 1, () => 0.5)).toEqual({
      ...playing,
      repeat: 'all',
    });
    expect(nextTrack({ ...playing, repeat: 'one' }, 1, () => 0.5)).toEqual({
      ...playing,
      repeat: 'one',
    });
  });

  it('moves backward, wrapping only when repeat all is active', () => {
    const first = { ...createPlaylistState(), index: 0 };
    const middle = { ...createPlaylistState(), index: 1 };

    expect(previousTrack(first, 3)).toBe(first);
    expect(previousTrack({ ...first, repeat: 'all' }, 3)).toEqual({
      ...first,
      repeat: 'all',
      index: 2,
    });
    expect(previousTrack(middle, 3)).toEqual({ ...middle, index: 0 });
  });

  it('leaves previous unchanged for empty, invalid, and one-track playlists', () => {
    const state = createPlaylistState();
    const invalid = { ...state, index: -1 };

    expect(previousTrack(state, 0)).toBe(state);
    expect(previousTrack(invalid, 3)).toBe(invalid);
    expect(previousTrack(state, 1)).toBe(state);
  });

  it('cycles repeat modes in the exact order without mutating the prior state', () => {
    const off = createPlaylistState();
    const all = cycleRepeat(off);
    const one = cycleRepeat(all);
    const reset = cycleRepeat(one);

    expect(all).toEqual({ ...off, repeat: 'all' });
    expect(one).toEqual({ ...off, repeat: 'one' });
    expect(reset).toEqual(off);
    expect(all).not.toBe(off);
  });

  it('toggles shuffle immutably', () => {
    const state = createPlaylistState();
    const enabled = toggleShuffle(state);

    expect(enabled).toEqual({ ...state, shuffle: true });
    expect(toggleShuffle(enabled)).toEqual(state);
    expect(enabled).not.toBe(state);
  });
});
