import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// Add this block of code for Tempo integration
const conditionalPlugins = [];
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      plugins: [...conditionalPlugins], // Add the conditional plugin
    }),
    tempo(), // Add the tempo plugin
    nodePolyfills(), // Add node polyfills for libraries that require Node.js APIs
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
});
