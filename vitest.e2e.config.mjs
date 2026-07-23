import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/e2e/**/*.e2e.test.js"],
    globals: true,
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
