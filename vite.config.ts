import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      strictPort: true,
    },
    preview: {
      // Permite que este host específico acesse o servidor
      allowedHosts: ["bariatrica-bariatricaemcasa.zn6b4j.easypanel.host",
                    "bariatricaemcasa.com.br",
                    "www,bariatricaemcasa.com.br",
                    ],
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
      sourcemap: mode === "development",
    },
  };
});
