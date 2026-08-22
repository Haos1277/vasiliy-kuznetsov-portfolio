const amber = '#f3a24a';
const paper = 'rgba(255, 255, 255, 0.42)';
const minimumBarHeight = 4;
const maximumBarHeightRatio = 0.9;
const barGap = 3.5;

function clamp(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function progressFromPointer(
  clientX: number,
  rect: Pick<DOMRect, 'left' | 'width'>,
): number {
  if (!Number.isFinite(rect.width) || rect.width <= 0) return 0;
  return clamp((clientX - rect.left) / rect.width);
}

export function drawWaveform(
  canvas: HTMLCanvasElement,
  peaks: readonly number[],
  progress: number,
): void {
  const { clientWidth: width, clientHeight: height } = canvas;
  if (width <= 0 || height <= 0 || peaks.length === 0) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  const pixelRatio = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);

  const totalGap = barGap * (peaks.length - 1);
  const barWidth = Math.max(1, (width - totalGap) / peaks.length);
  const completeBars = Math.round(peaks.length * clamp(progress));
  const maximumBarHeight = Math.max(minimumBarHeight, height * maximumBarHeightRatio);

  peaks.forEach((peak, index) => {
    const normalizedPeak = Number.isFinite(peak) ? clamp(peak) : 0;
    const barHeight = minimumBarHeight + (maximumBarHeight - minimumBarHeight) * normalizedPeak;
    const x = index * (barWidth + barGap);
    const y = (height - barHeight) / 2;

    context.fillStyle = index < completeBars ? amber : paper;
    context.fillRect(x, y, barWidth, barHeight);
  });
}

export function bindWaveformSeek(
  canvas: HTMLCanvasElement,
  onSeek: (progress: number) => void,
): () => void {
  let activePointerId: number | undefined;

  const seek = (clientX: number) => {
    onSeek(progressFromPointer(clientX, canvas.getBoundingClientRect()));
  };
  const releasePointer = () => {
    const pointerId = activePointerId;
    activePointerId = undefined;
    if (pointerId === undefined || !canvas.releasePointerCapture) return;
    try {
      canvas.releasePointerCapture(pointerId);
    } catch {
      // Synthetic events and browser cancellation can release capture first.
    }
  };
  const onPointerDown = (event: PointerEvent) => {
    if (activePointerId !== undefined) return;
    activePointerId = event.pointerId;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is unavailable in some embedded contexts.
    }
    seek(event.clientX);
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) return;
    seek(event.clientX);
  };
  const onPointerUpOrCancel = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) return;
    releasePointer();
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUpOrCancel);
  canvas.addEventListener('pointercancel', onPointerUpOrCancel);

  return () => {
    releasePointer();
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUpOrCancel);
    canvas.removeEventListener('pointercancel', onPointerUpOrCancel);
  };
}
