import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: '/vasiliy-kuznetsov-portfolio/',
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        photography: fileURLToPath(
          new URL('./photography/index.html', import.meta.url),
        ),
        video: fileURLToPath(new URL('./video/index.html', import.meta.url)),
        ai: fileURLToPath(new URL('./ai/index.html', import.meta.url)),
        music: fileURLToPath(new URL('./music/index.html', import.meta.url)),
      },
    },
  },
  test: {
    environment: 'jsdom',
    clearMocks: true,
    env: {
      BASE_URL: '/vasiliy-kuznetsov-portfolio/',
    },
  },
});
