import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import sqlocal from "sqlocal/vite";
import { precache } from "./precache-plugin";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@/": `${import.meta.dirname}/src/`,
      "@worker/": `${import.meta.dirname}/worker/`,
    },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    cloudflare(),
    sqlocal(),
    precache(),
  ],
});
