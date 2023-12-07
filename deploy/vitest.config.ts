import { defineConfig as configure } from 'vitest/config';

export default configure({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,

    include: [
      'src/**/*.test.ts',
    ],

    coverage: {
      all: true,
      clean: true,
      skipFull: true,

      include: [
        'src/**/*',
      ],

      exclude: [
        'src/**/*.test.ts',
        'src/main.{ts,cjs}',
      ],

      reportsDirectory: 'build/coverage',
      reporter: ['text', 'html'],

      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    },
  },
});
