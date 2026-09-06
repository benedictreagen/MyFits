import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  // Set base path to '/MyFits/' for GitHub Pages builds, or allow custom override via BASE_URL
  const base = process.env.BASE_URL || (command === 'build' ? '/MyFits/' : '/');

  return {
    base,
    plugins: [
      {
        name: 'dual-html-handler',
        // In development mode (serve) or pre-build, rewrite any built asset references back to source /src/main.tsx
        transformIndexHtml: {
          order: 'pre',
          handler(html) {
            return html
              .replace(
                /<script\s+type="module"\s+crossorigin\s+src="[^"]*assets\/(?:main|app)\.js"><\/script>/gi,
                '<script type="module" src="/src/main.tsx"></script>'
              )
              .replace(
                /<link\s+rel="stylesheet"\s+crossorigin\s+href="[^"]*assets\/style\.css"[^>]*>/gi,
                ''
              );
          },
        },
      },
      react(),
      tailwindcss(),
      {
        name: 'copy-production-assets-for-github-pages',
        closeBundle() {
          const distDir = path.resolve(__dirname, 'dist');
          const indexPath = path.join(distDir, 'index.html');
          const notFoundPath = path.join(distDir, '404.html');
          const nojekyllPath = path.join(distDir, '.nojekyll');
          if (fs.existsSync(indexPath)) {
            fs.copyFileSync(indexPath, notFoundPath);
          }
          fs.writeFileSync(nojekyllPath, '');

          // 1. Also mirror to docs/ folder for GitHub Pages /docs branch support
          const docsDir = path.resolve(__dirname, 'docs');
          if (fs.existsSync(docsDir)) {
            fs.rmSync(docsDir, { recursive: true, force: true });
          }
          fs.mkdirSync(docsDir, { recursive: true });
          fs.cpSync(distDir, docsDir, { recursive: true });

          // 2. Also mirror assets, index.html, 404.html, and .nojekyll to project root
          // This guarantees that if GitHub Pages deploys from the root of 'main', all bundles are available!
          const rootAssetsDir = path.resolve(__dirname, 'assets');
          const distAssetsDir = path.join(distDir, 'assets');
          if (fs.existsSync(distAssetsDir)) {
            if (fs.existsSync(rootAssetsDir)) {
              fs.rmSync(rootAssetsDir, { recursive: true, force: true });
            }
            fs.mkdirSync(rootAssetsDir, { recursive: true });
            fs.cpSync(distAssetsDir, rootAssetsDir, { recursive: true });
          }
          if (fs.existsSync(notFoundPath)) {
            fs.copyFileSync(notFoundPath, path.resolve(__dirname, '404.html'));
          }
          if (fs.existsSync(indexPath)) {
            fs.copyFileSync(indexPath, path.resolve(__dirname, 'index.html'));
          }
          fs.writeFileSync(path.resolve(__dirname, '.nojekyll'), '');
        },
      },
    ],
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/main.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'assets/style.css';
            }
            return 'assets/[name].[ext]';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
