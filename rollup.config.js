import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const extensions = ['.js', '.ts', '.tsx'];

export default [
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.js',
      format: 'umd',
      sourcemap: true,
      name: 'usePull',
      globals: {
        react: 'React',
      },
    },
    plugins: [
      resolve({
        extensions,
      }),
      babel({
        babelrc: false,
        presets: ['@babel/preset-env', '@babel/preset-typescript'],
        babelHelpers: 'bundled',
        extensions,
      }),
    ],
    external: ['react', 'use-pull'],
  },
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve({
        extensions,
        modulesOnly: true,
      }),
      babel({
        babelrc: false,
        presets: ['@babel/preset-typescript'],
        plugins: ['@babel/plugin-transform-runtime'],
        babelHelpers: 'runtime',
        extensions,
      }),
    ],
    external: ['react', 'use-pull'],
  },
];
