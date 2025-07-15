/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { fileURLToPath } from 'node:url';
const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// Plugin to conditionally inject Cloudflare Analytics
const cloudflareAnalyticsPlugin = () => {
  return {
    name: 'cloudflare-analytics',
    transformIndexHtml(html: string) {
      const token = process.env.VITE_CLOUDFLARE_ANALYTICS_TOKEN;
      const script = token
        ? `<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "${token}"}'></script><!-- End Cloudflare Web Analytics -->`
        : '';
      return html.replace('%VITE_CLOUDFLARE_ANALYTICS_SCRIPT%', script);
    },
  };
};

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), cloudflareAnalyticsPlugin()],
  root: 'src/client',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
      '@client': path.resolve(__dirname, './src/client'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
