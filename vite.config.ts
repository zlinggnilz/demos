import react from '@vitejs/plugin-react';
import path from 'path';
import postcssPresetEnv from 'postcss-preset-env';
import { defineConfig, loadEnv } from 'vite';

// import postCssPxToRem from "postcss-pxtorem"
// import postCssPxToViewport from 'postcss-px-to-viewport'
import CustomRoute from './scripts/route-w';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    assetsInclude: ['**/*.gltf', '**/*.glb'],
    base: env.VITE_BASE,
    plugins: [react(), CustomRoute(process.env.NODE_ENV)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/'),
      },
    },
    define: {
      'process.env': process.env,
    },
    css: {
      modules: {
        // generateScopedName: '[name]_[local]_[hash:base64:5]',
        generateScopedName: function (localName, filename, css) {
          const match = filename.match(/src(.*)/);
          if (match && match[1]) {
            let p = match[1].includes('?') ? match[1].substring(0, match[1].lastIndexOf('?')) : match[1];
            p = p.replace(/(index|style|styles).module.less$/, '');
            const arr = p
              .replace(/\\/g, '/')
              .replace(/(^\/|\/$)/g, '')
              .split('/')
              .map((a: string) => a.replace(/([A-Z])/g, '-$1').toLowerCase());
            return `${arr.join('-')}-${localName}`
              .replace('pages-', '')
              .replace(/-component-|-components-/g, '-')
              .replace(/components-/g, 'cs')
              .replace(/-+/g, '-')
              .replace(/^-/, '');
          }

          return localName;
        },
        hashPrefix: 'prefix',
      },
      preprocessorOptions: {
        less: {
          math: 'always',
          additionalData: `@import "${path.resolve(__dirname, 'src/style/val.less')}";`,
          javascriptEnabled: true,
        },
      },
      postcss: {
        plugins: [
          postcssPresetEnv(),

          /**
           * 暂时建议用rem
           */
          // postCssPxToViewport({
          //   viewportWidth: 750,
          //   unitPrecision:5,
          //   unitToConvert:'px',
          //   mediaQuery:true,
          //   minPixelValue:1,
          // }),
          // postCssPxToRem({
          //   rootValue: 16,
          //   propList: ['*'],
          //   unitPrecision: 5,
          //   exclude: /(node_module)/,
          // })
        ],
      },
    },
    server: {
      host: true,
      // proxy: {
      //   '/api': {
      //     target: 'http://127.0.0.1',
      //     changeOrigin: true,
      //     rewrite: (path) => path.replace(/^\/api/, ''),
      //   },
      // },
    },
    build: {
      sourcemap: false,
    },
  });
};
