import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        app: resolve(__dirname, "me_we_plataforma.html"),
      },
    },
  },
});
