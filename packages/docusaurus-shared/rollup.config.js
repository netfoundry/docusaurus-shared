// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

export default {
  input: {
    index: 'src/index.ts',
    'plugins/remarkScopedPath/remarkScopedPath': 'src/plugins/remarkScopedPath/remarkScopedPath.ts',
  },
  external: [
    'react',
    'react-dom',
    'clsx',
    'tslib',
    'react-github-btn',
    /^@docusaurus\//,
    /^@theme\//
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
      extensions: ['.mjs', '.js', '.json', '.ts', '.tsx'],
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
    }),
    postcss({
      modules: {
        // Disable CSS modules for anything in the /css/ folder
        auto: (name) => !/\/css\//.test(name),
      },
      extract: 'index.css',
      minimize: true,
    }),
  ],
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    entryFileNames: '[name].js',
  }

};
