import type { MusicTrack } from './music-types';
import {
  createPlaylistState,
  cycleRepeat,
  nextTrack,
  previousTrack,
  selectTrack,
  toggleShuffle,
  type PlaylistState,
} from './playlist-state';
import { withBase } from './paths';
import { bindWaveformSeek, drawWaveform } from './waveform';

type PlayerElements = {
  audio: HTMLAudioElement;
  play: HTMLButtonElement;
  previous: HTMLButtonElement;
  next: HTMLButtonElement;
  seek: HTMLInputElement;
  waveform: HTMLCanvasElement;
  volume: HTMLInputElement;
  shuffle: HTMLButtonElement;
  repeat: HTMLButtonElement;
  current: HTMLElement;
  duration: HTMLElement;
  title: HTMLElement;
  error: HTMLElement;
};

const selectors = {
  audio: '[data-music-audio]',
  play: '[data-music-play]',
  previous: '[data-music-prev]',
  next: '[data-music-next]',
  seek: '[data-music-seek]',
  waveform: '[data-music-waveform]',
  volume: '[data-music-volume]',
  shuffle: '[data-music-shuffle]',
  repeat: '[data-music-repeat]',
  current: '[data-music-current]',
  duration: '[data-music-duration]',
  title: '[data-music-title]',
  error: '[data-music-error]',
} as const;

const clampProgress = (value: number): number =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

const isPlayableDuration = (duration: number): boolean =>
  Number.isFinite(duration) && duration > 0;

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const getElements = (root: HTMLElement): PlayerElements | undefined => {
  const audio = root.querySelector<HTMLAudioElement>(selectors.audio);
  const play = root.querySelector<HTMLButtonElement>(selectors.play);
  const previous = root.querySelector<HTMLButtonElement>(selectors.previous);
  const next = root.querySelector<HTMLButtonElement>(selectors.next);
  const seek = root.querySelector<HTMLInputElement>(selectors.seek);
  const waveform = root.querySelector<HTMLCanvasElement>(selectors.waveform);
  const volume = root.querySelector<HTMLInputElement>(selectors.volume);
  const shuffle = root.querySelector<HTMLButtonElement>(selectors.shuffle);
  const repeat = root.querySelector<HTMLButtonElement>(selectors.repeat);
  const current = root.querySelector<HTMLElement>(selectors.current);
  const duration = root.querySelector<HTMLElement>(selectors.duration);
  const title = root.querySelector<HTMLElement>(selectors.title);
  const error = root.querySelector<HTMLElement>(selectors.error);

  if (
    !audio ||
    !play ||
    !previous ||
    !next ||
    !seek ||
    !waveform ||
    !volume ||
    !shuffle ||
    !repeat ||
    !current ||
    !duration ||
    !title ||
    !error
  ) {
    return undefined;
  }

  return {
    audio,
    play,
    previous,
    next,
    seek,
    waveform,
    volume,
    shuffle,
    repeat,
    current,
    duration,
    title,
    error,
  };
};

export function initMusicPlayer(root: HTMLElement, tracks: readonly MusicTrack[]): () => void {
  const elements = getElements(root);
  if (!elements) return () => undefined;

  const trackButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-music-track]'),
  );
  let state: PlaylistState = createPlaylistState();
  let errorMessage = '';
  let animationFrame: number | undefined;
  let playRequest = 0;
  let disposed = false;

  const selectedTrack = (): MusicTrack | undefined => tracks[state.index];
  const mediaDuration = (): number =>
    isPlayableDuration(elements.audio.duration) ? elements.audio.duration : 0;
  const displayDuration = (): number => mediaDuration() || selectedTrack()?.duration || 0;
  const progress = (): number => {
    const duration = mediaDuration();
    return duration && Number.isFinite(elements.audio.currentTime)
      ? clampProgress(elements.audio.currentTime / duration)
      : 0;
  };

  const cancelAnimation = (): void => {
    if (animationFrame === undefined) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
  };

  const render = (): void => {
    const track = selectedTrack();
    const currentProgress = progress();
    const hasTracks = tracks.length > 0;

    elements.title.textContent = track?.title ?? 'Нет доступных композиций';
    elements.current.textContent = formatTime(elements.audio.currentTime);
    elements.duration.textContent = formatTime(displayDuration());
    elements.seek.value = String(currentProgress);
    elements.seek.disabled = !track;
    elements.play.disabled = !track;
    elements.previous.disabled = !track;
    elements.next.disabled = !track;
    elements.shuffle.disabled = !hasTracks;
    elements.repeat.disabled = !hasTracks;
    elements.play.textContent = state.playing ? 'Пауза' : 'Воспроизвести';
    elements.play.setAttribute('aria-label', state.playing ? 'Поставить на паузу' : 'Воспроизвести');
    elements.play.setAttribute('aria-pressed', String(state.playing));
    elements.previous.setAttribute('aria-label', 'Предыдущая композиция');
    elements.next.setAttribute('aria-label', 'Следующая композиция');
    elements.shuffle.setAttribute('aria-pressed', String(state.shuffle));
    elements.shuffle.setAttribute(
      'aria-label',
      state.shuffle ? 'Выключить случайный порядок' : 'Включить случайный порядок',
    );
    elements.repeat.setAttribute('aria-pressed', String(state.repeat !== 'off'));
    elements.repeat.setAttribute(
      'aria-label',
      state.repeat === 'one'
        ? 'Повторять текущую композицию'
        : state.repeat === 'all'
          ? 'Повторять весь список'
          : 'Выключить повтор',
    );
    elements.repeat.textContent =
      state.repeat === 'one' ? 'Повтор: один' : state.repeat === 'all' ? 'Повтор: все' : 'Повтор';
    elements.volume.value = String(clampProgress(elements.audio.volume));
    elements.error.textContent = errorMessage;
    elements.error.hidden = errorMessage.length === 0;
    root.classList.toggle('is-playing', state.playing);

    for (const button of trackButtons) {
      const active = button.dataset.musicTrack === track?.id;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
      button.setAttribute('aria-pressed', String(active));
    }

    drawWaveform(elements.waveform, track?.peaks ?? [], currentProgress);
  };

  const drawFrame = (): void => {
    animationFrame = undefined;
    if (!state.playing) return;
    render();
    animationFrame = requestAnimationFrame(drawFrame);
  };

  const startAnimation = (): void => {
    if (!state.playing || animationFrame !== undefined) return;
    animationFrame = requestAnimationFrame(drawFrame);
  };

  const stopWithError = (): void => {
    playRequest += 1;
    state = { ...state, playing: false };
    errorMessage = 'Не удалось воспроизвести композицию. Выберите другой трек и попробуйте снова.';
    cancelAnimation();
    render();
  };

  const requestPlayback = (): void => {
    const request = ++playRequest;
    try {
      void Promise.resolve(elements.audio.play()).catch(() => {
        if (!disposed && request === playRequest) stopWithError();
      });
    } catch {
      if (!disposed && request === playRequest) stopWithError();
    }
  };

  const loadSelectedTrack = (shouldPlay: boolean): void => {
    const track = selectedTrack();
    if (!track) return;

    playRequest += 1;
    cancelAnimation();
    elements.audio.src = withBase(track.src);
    elements.audio.currentTime = 0;
    state = { ...state, playing: shouldPlay };
    errorMessage = '';
    render();
    if (shouldPlay) requestPlayback();
  };

  const seekTo = (value: number): void => {
    const duration = mediaDuration();
    if (!duration) return;

    elements.audio.currentTime = clampProgress(value) * duration;
    render();
  };

  const onPlayClick = (): void => {
    if (!selectedTrack()) return;
    if (state.playing) {
      playRequest += 1;
      state = { ...state, playing: false };
      cancelAnimation();
      elements.audio.pause();
      render();
      return;
    }

    if (!elements.audio.hasAttribute('src')) {
      loadSelectedTrack(true);
      return;
    }

    state = { ...state, playing: true };
    errorMessage = '';
    render();
    requestPlayback();
  };

  const onPreviousClick = (): void => {
    const nextState = previousTrack(state, tracks.length);
    if (nextState === state) return;
    state = { ...nextState, playing: true };
    loadSelectedTrack(true);
  };

  const onNextClick = (): void => {
    const nextState = nextTrack({ ...state, playing: true }, tracks.length, Math.random);
    if (nextState.index === state.index && !nextState.playing) {
      state = nextState;
      cancelAnimation();
      elements.audio.pause();
      render();
      return;
    }

    state = { ...nextState, playing: true };
    loadSelectedTrack(true);
  };

  const onTrackClick = (event: Event): void => {
    const target = event.currentTarget as HTMLButtonElement;
    const index = tracks.findIndex((track) => track.id === target.dataset.musicTrack);
    const nextState = selectTrack(state, index, tracks.length);
    if (nextState === state) return;
    state = nextState;
    loadSelectedTrack(true);
  };

  const onSeekInput = (): void => seekTo(Number(elements.seek.value));
  const onVolumeInput = (): void => {
    elements.audio.volume = clampProgress(Number(elements.volume.value));
    render();
  };
  const onShuffleClick = (): void => {
    state = toggleShuffle(state);
    render();
  };
  const onRepeatClick = (): void => {
    state = cycleRepeat(state);
    render();
  };
  const onLoadedMetadata = (): void => render();
  const onTimeUpdate = (): void => render();
  const onAudioPlay = (): void => {
    state = { ...state, playing: true };
    errorMessage = '';
    render();
    startAnimation();
  };
  const onAudioPause = (): void => {
    state = { ...state, playing: false };
    cancelAnimation();
    render();
  };
  const onEnded = (): void => {
    const previousIndex = state.index;
    state = nextTrack({ ...state, playing: true }, tracks.length, Math.random);
    if (!state.playing) {
      cancelAnimation();
      render();
      return;
    }

    if (state.index !== previousIndex) {
      loadSelectedTrack(true);
      return;
    }

    elements.audio.currentTime = 0;
    render();
    requestPlayback();
  };
  const onAudioError = (): void => stopWithError();
  const onVolumeChange = (): void => render();

  elements.play.addEventListener('click', onPlayClick);
  elements.previous.addEventListener('click', onPreviousClick);
  elements.next.addEventListener('click', onNextClick);
  elements.seek.addEventListener('input', onSeekInput);
  elements.volume.addEventListener('input', onVolumeInput);
  elements.shuffle.addEventListener('click', onShuffleClick);
  elements.repeat.addEventListener('click', onRepeatClick);
  elements.audio.addEventListener('loadedmetadata', onLoadedMetadata);
  elements.audio.addEventListener('timeupdate', onTimeUpdate);
  elements.audio.addEventListener('play', onAudioPlay);
  elements.audio.addEventListener('pause', onAudioPause);
  elements.audio.addEventListener('ended', onEnded);
  elements.audio.addEventListener('error', onAudioError);
  elements.audio.addEventListener('volumechange', onVolumeChange);
  for (const button of trackButtons) button.addEventListener('click', onTrackClick);
  const cleanupWaveform = bindWaveformSeek(elements.waveform, seekTo);

  render();

  return () => {
    if (disposed) return;
    const wasActive = state.playing;
    disposed = true;
    playRequest += 1;
    cancelAnimation();
    state = { ...state, playing: false };
    render();
    cleanupWaveform();
    elements.play.removeEventListener('click', onPlayClick);
    elements.previous.removeEventListener('click', onPreviousClick);
    elements.next.removeEventListener('click', onNextClick);
    elements.seek.removeEventListener('input', onSeekInput);
    elements.volume.removeEventListener('input', onVolumeInput);
    elements.shuffle.removeEventListener('click', onShuffleClick);
    elements.repeat.removeEventListener('click', onRepeatClick);
    elements.audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    elements.audio.removeEventListener('timeupdate', onTimeUpdate);
    elements.audio.removeEventListener('play', onAudioPlay);
    elements.audio.removeEventListener('pause', onAudioPause);
    elements.audio.removeEventListener('ended', onEnded);
    elements.audio.removeEventListener('error', onAudioError);
    elements.audio.removeEventListener('volumechange', onVolumeChange);
    for (const button of trackButtons) button.removeEventListener('click', onTrackClick);
    if (wasActive) elements.audio.pause();
  };
}
