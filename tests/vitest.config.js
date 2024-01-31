import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.js'],
    hookTimeout: 120000
  },
});
