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
        'src/server.ts',

        'src/database/connection.ts',
        'src/database/connection-cli.ts',
        'src/database/schema/**',
        'src/database/schema.ts',
        'src/database/table.ts',

        'src/**/*.test.ts',
      ],

      reportsDirectory: 'build/coverage',
      reporter: ['text', 'html-spa'],

      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    },
  },
});
