import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/azure-openai": {
        target: (env.VITE_AZURE_OPENAI_ENDPOINT ?? "https://genai-trigent-openai.openai.azure.com").replace(/\/$/, ""),
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/azure-openai/, ""),
        headers: {
          "api-key": env.VITE_AZURE_OPENAI_API_KEY ?? "",
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
});
