import { spawnSync } from 'node:child_process';

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

function extractPeaks(input, bucketCount) {
  const result = spawnSync('ffmpeg', [
    '-v',
    'error',
    '-i',
    input,
    '-ac',
    '1',
    '-ar',
    '8000',
    '-f',
    'f32le',
    'pipe:1',
  ], {
    maxBuffer: 16 * 1024 * 1024,
  });

  if (result.error) {
    throw new Error(`Unable to run ffmpeg: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const details = result.stderr.toString().trim();
    throw new Error(details || 'ffmpeg failed to decode the input audio.');
  }

  const pcm = result.stdout;
  if (pcm.length === 0) {
    throw new Error('ffmpeg produced empty PCM output.');
  }

  if (pcm.length % 4 !== 0) {
    throw new Error('ffmpeg produced incomplete float32 PCM output.');
  }

  const sampleCount = pcm.length / 4;
  const bucketPeaks = Array.from({ length: bucketCount }, (_, bucketIndex) => {
    const start = Math.floor((bucketIndex * sampleCount) / bucketCount);
    const end = Math.floor(((bucketIndex + 1) * sampleCount) / bucketCount);
    let peak = 0;

    for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
      const sample = pcm.readFloatLE(sampleIndex * 4);
      peak = Math.max(peak, Number.isFinite(sample) ? Math.abs(sample) : 0);
    }

    return peak;
  });
  const globalPeak = Math.max(...bucketPeaks);

  return globalPeak === 0
    ? bucketPeaks.map(() => 0)
    : bucketPeaks.map((peak) => Math.round((peak / globalPeak) * 1000) / 1000);
}

const [input, bucketCountText, ...extraArguments] = process.argv.slice(2);
const bucketCount = Number(bucketCountText);

if (
  !input ||
  !bucketCountText ||
  extraArguments.length > 0 ||
  !Number.isSafeInteger(bucketCount) ||
  bucketCount <= 0
) {
  fail('Usage: node scripts/audio-peaks.mjs <mp3-path> <positive-bucket-count>');
} else {
  try {
    process.stdout.write(`${JSON.stringify(extractPeaks(input, bucketCount))}\n`);
  } catch (error) {
    fail(error instanceof Error ? error.message : 'Unable to extract audio peaks.');
  }
}
