// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

const plugins = [
    peerDepsExternal(),
    resolve({ browser: true, extensions: ['.mjs', '.js', '.json', '.ts', '.tsx'] }),
    commonjs(),
    typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src',
    }),
    postcss({
        modules: {
            // treat everything as modules EXCEPT /css/*
            auto: (name) => !/\/css\//.test(name),
        },
        extract: 'index.css',
        minimize: true,
    })
];

export default {
    input: { node: 'src/node.ts', ui: 'src/ui.ts' },
    external: [
        'react', 'react-dom', 'clsx', 'tslib', 'react-github-btn',
        /^@docusaurus\//, /^@theme\//, 'fs', 'path',
    ],
    plugins,
    output: [
        { dir: 'dist', entryFileNames: '[name].cjs.js', format: 'cjs', sourcemap: true },
        { dir: 'dist', entryFileNames: '[name].esm.js', format: 'esm', sourcemap: true },
    ],
};
