import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'fs';
import archiver from 'archiver';
import { createWriteStream } from 'fs';

export default defineConfig(({ mode }) => {
  const isFirefox = mode === 'firefox';
  const isChromium = mode === 'chromium';
  
  return {
    build: {
      outDir: `dist/${isFirefox ? 'firefox' : 'chromium'}`,
      emptyOutDir: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        input: {
          background: resolve(__dirname, 'js/background.js'),
          app: resolve(__dirname, 'js/app.js'),
          index: resolve(__dirname, 'js/index.js'),
        },
        output: {
          entryFileNames: 'js/[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith('.css')) {
              return 'css/[name][extname]';
            }
            return 'assets/[name][extname]';
          },
        },
        external: [
          /^\.\/js\/vendor\/.*/,
          /^\.\/js\/native\.js$/,
        ],
      },
    },
    plugins: [
      {
        name: 'copy-extension-files',
        closeBundle() {
          const target = isFirefox ? 'firefox' : 'chromium';
          const distDir = `dist/${target}`;
          
          // 复制 manifest
          const manifestSrc = isFirefox ? 'manifest_firefox.json' : 'manifest_chromium.json';
          cpSync(manifestSrc, `${distDir}/manifest.json`);
          
          // 复制 HTML 文件
          cpSync('home.html', `${distDir}/home.html`);
          cpSync('installed.html', `${distDir}/installed.html`);
          
          // 复制 LICENSE
          cpSync('LICENSE', `${distDir}/LICENSE`);
          
          // 复制 img 目录
          cpSync('img', `${distDir}/img`, { recursive: true });
          
          // 复制 css 目录
          cpSync('css', `${distDir}/css`, { recursive: true });
          
          // 复制 vendor 和 util
          mkdirSync(`${distDir}/js/vendor`, { recursive: true });
          cpSync('js/vendor', `${distDir}/js/vendor`, { recursive: true });
          cpSync('js/util.js', `${distDir}/js/util.js`);
          
          console.log(`✓ Copied extension files for ${target}`);
        },
      },
      {
        name: 'create-zip',
        closeBundle() {
          const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
          const version = pkg.version || '0.1.0';
          const target = isFirefox ? 'firefox' : 'chromium';
          const zipName = `BiliScape_v${version}_${target}.zip`;
          const distDir = `dist/${target}`;
          
          return new Promise((resolve, reject) => {
            const output = createWriteStream(zipName);
            const archive = archiver('zip', { zlib: { level: 9 } });
            
            output.on('close', () => {
              console.log(`✓ Created ${zipName} (${archive.pointer()} bytes)`);
              resolve();
            });
            
            archive.on('error', reject);
            archive.pipe(output);
            archive.directory(distDir, false);
            archive.finalize();
          });
        },
      },
    ],
  };
});