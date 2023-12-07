import { defineConfig as configure } from 'vitest/config';

export default configure({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,

    include: [
      'src/**/*.test.ts',
      'tests/**/*.test.ts',
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

        'src/resource.ts',
        'src/resource/**',
      ],

      reportsDirectory: 'build/coverage',
      reporter: ['text', 'html'],

      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
});
