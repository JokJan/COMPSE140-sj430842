import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.js'],
    hookTimeout: 90000
  },
});
