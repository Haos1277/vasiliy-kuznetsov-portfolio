import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/vasiliy-kuznetsov-portfolio/',
  build: {
    target: 'es2022',
  },
  test: {
    environment: 'jsdom',
    clearMocks: true,
  },
});
