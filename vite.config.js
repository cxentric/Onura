import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import { apiMiddleware } from "./server/api.mjs";

// Serves the /api routes (server/api.mjs) from the Vite dev and preview servers,
// so OPENAI_API_KEY stays server-side in development too.
function onuraApi() {
  return {
    name: "onura-api",
    configureServer(server) {
      server.middlewares.use(apiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiMiddleware);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load non-VITE_ vars (e.g. OPENAI_API_KEY) into process.env for the API middleware.
  // They are NOT exposed to client code; only VITE_-prefixed vars are.
  Object.assign(process.env, { ...loadEnv(mode, process.cwd(), ""), ...process.env });

  return {
    // This changes the out put dir from dist to build
    // comment this out if that isn't relevant for your project
    build: {
      outDir: "build",
      chunkSizeWarningLimit: 2000,
    },
    plugins: [tsconfigPaths(), react(), tagger(), onuraApi()],
    server: {
      port: "4028",
      host: "0.0.0.0",
      strictPort: true,
      allowedHosts: ['.amazonaws.com', '.builtwithrocket.new']
    }
  };
});
