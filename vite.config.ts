import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "0.0.0.0", // mais compatível do que "::"
      port: 8080,
      strictPort: true, // garante que não troca a porta automaticamente
    },
    plugins: [
      react(),
      mode === "development" ? componentTagger() : null,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: mode === "development", // facilita debug no dev
    },
  };
});
