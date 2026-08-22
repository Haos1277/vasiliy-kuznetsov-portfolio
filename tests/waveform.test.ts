import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  bindWaveformSeek,
  drawWaveform,
  progressFromPointer,
} from '../src/lib/waveform';

const pointerEvent = (type: string, clientX: number, pointerId: number): PointerEvent => {
  const event = new MouseEvent(type, { bubbles: true, clientX });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  return event as PointerEvent;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('waveform utilities', () => {
  it('normalizes and clamps a pointer position, including a zero-width canvas', () => {
    const rect = { left: 100, width: 400 };

    expect(progressFromPointer(300, rect)).toBe(0.5);
    expect(progressFromPointer(0, rect)).toBe(0);
    expect(progressFromPointer(700, rect)).toBe(1);
    expect(progressFromPointer(100, { left: 100, width: 0 })).toBe(0);
    expect(progressFromPointer(100, { left: 100, width: -1 })).toBe(0);
  });

  it('draws high-DPI symmetric bars with amber progress and paper idle peaks', () => {
    const canvas = document.createElement('canvas');
    Object.defineProperties(canvas, {
      clientWidth: { value: 100 },
      clientHeight: { value: 40 },
    });
    const fills: Array<{ style: string; x: number; y: number; width: number; height: number }> = [];
    let fillStyle = '';
    const context = {
      clearRect: vi.fn(),
      fillRect: vi.fn((x: number, y: number, width: number, height: number) => {
        fills.push({ style: fillStyle, x, y, width, height });
      }),
      setTransform: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    Object.defineProperty(context, 'fillStyle', {
      get: () => fillStyle,
      set: (value: string) => {
        fillStyle = value;
      },
    });
    vi.spyOn(canvas, 'getContext').mockReturnValue(context);
    const originalRatio = window.devicePixelRatio;
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 });

    drawWaveform(canvas, [0, 0.5, 1], 0.5);

    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(80);
    expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 100, 40);
    expect(fills).toHaveLength(3);
    expect(fills.map(({ style }) => style)).toEqual([
      '#f3a24a',
      '#f3a24a',
      'rgba(255, 255, 255, 0.42)',
    ]);
    expect(fills.map(({ y, height }) => y + height / 2)).toEqual([20, 20, 20]);
    expect(fills[0].height).toBeLessThan(fills[1].height);
    expect(fills[1].height).toBeLessThan(fills[2].height);

    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: originalRatio });
  });

  it('keeps every dense waveform bar within the logical canvas width', () => {
    for (const width of [320, 160, 1000]) {
      const canvas = document.createElement('canvas');
      Object.defineProperties(canvas, {
        clientWidth: { value: width },
        clientHeight: { value: 40 },
      });
      const fills: Array<{ x: number; width: number }> = [];
      const context = {
        clearRect: vi.fn(),
        fillRect: vi.fn((x: number, _y: number, barWidth: number) => {
          fills.push({ x, width: barWidth });
        }),
        setTransform: vi.fn(),
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D;
      vi.spyOn(canvas, 'getContext').mockReturnValue(context);

      drawWaveform(canvas, Array.from({ length: 192 }, () => 0.5), 0);

      expect(fills).toHaveLength(192);
      expect(fills.every(({ x, width: barWidth }) => x >= 0 && x + barWidth <= width)).toBe(true);
    }
  });

  it('does not draw or throw for a zero-size canvas', () => {
    const canvas = document.createElement('canvas');
    Object.defineProperties(canvas, {
      clientWidth: { configurable: true, value: 0 },
      clientHeight: { configurable: true, value: 40 },
    });
    const getContext = vi.spyOn(canvas, 'getContext');

    expect(() => drawWaveform(canvas, [1], 0.5)).not.toThrow();
    expect(getContext).not.toHaveBeenCalled();
  });

  it('resets and clears a non-zero canvas when waveform peaks are empty', () => {
    const canvas = document.createElement('canvas');
    Object.defineProperties(canvas, {
      clientWidth: { value: 100 },
      clientHeight: { value: 40 },
    });
    const context = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      setTransform: vi.fn(),
      fillStyle: '',
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(canvas, 'getContext').mockReturnValue(context);
    const originalRatio = window.devicePixelRatio;
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 });

    expect(() => drawWaveform(canvas, [], 0.5)).not.toThrow();

    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(80);
    expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 100, 40);
    expect(context.fillRect).not.toHaveBeenCalled();

    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: originalRatio });
  });

  it('seeks while its active pointer is captured and releases it on up or cancel', () => {
    const canvas = document.createElement('canvas');
    document.body.append(canvas);
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 100, width: 400 } as DOMRect);
    const setPointerCapture = vi.fn();
    const releasePointerCapture = vi.fn();
    Object.assign(canvas, { setPointerCapture, releasePointerCapture });
    const onSeek = vi.fn();
    const cleanup = bindWaveformSeek(canvas, onSeek);

    canvas.dispatchEvent(pointerEvent('pointerdown', 200, 8));
    canvas.dispatchEvent(pointerEvent('pointermove', 500, 8));
    canvas.dispatchEvent(pointerEvent('pointermove', 600, 9));
    canvas.dispatchEvent(pointerEvent('pointerup', 500, 8));
    canvas.dispatchEvent(pointerEvent('pointerdown', 300, 10));
    canvas.dispatchEvent(pointerEvent('pointercancel', 300, 10));

    expect(onSeek).toHaveBeenNthCalledWith(1, 0.25);
    expect(onSeek).toHaveBeenNthCalledWith(2, 1);
    expect(onSeek).toHaveBeenNthCalledWith(3, 0.5);
    expect(setPointerCapture).toHaveBeenNthCalledWith(1, 8);
    expect(setPointerCapture).toHaveBeenNthCalledWith(2, 10);
    expect(releasePointerCapture).toHaveBeenNthCalledWith(1, 8);
    expect(releasePointerCapture).toHaveBeenNthCalledWith(2, 10);
    cleanup();
  });

  it('releases an active capture and removes every listener during cleanup', () => {
    const canvas = document.createElement('canvas');
    document.body.append(canvas);
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 100 } as DOMRect);
    const releasePointerCapture = vi.fn();
    Object.assign(canvas, {
      setPointerCapture: vi.fn(),
      releasePointerCapture,
    });
    const onSeek = vi.fn();
    const cleanup = bindWaveformSeek(canvas, onSeek);

    canvas.dispatchEvent(pointerEvent('pointerdown', 25, 1));
    cleanup();
    canvas.dispatchEvent(pointerEvent('pointermove', 75, 1));
    canvas.dispatchEvent(pointerEvent('pointerdown', 50, 2));

    expect(releasePointerCapture).toHaveBeenCalledWith(1);
    expect(onSeek).toHaveBeenCalledTimes(1);
  });
});
