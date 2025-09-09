import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

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
                    "www.bariatricaemcasa.com.br",
                    ],
    },
    plugins: [
      react(),
      mode === "development" ? componentTagger() : null,
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
        manifest: {
          name: 'Bariatrica em Casa',
          short_name: 'Bariatrica',
          description: 'Programa delicado de 30 dias para perda de peso',
          theme_color: '#10B981',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
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
