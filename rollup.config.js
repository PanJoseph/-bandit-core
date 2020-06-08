import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

module.exports = [
  {
    // CommonJS config
    input: 'index.js',
    output: {
      file: 'cjs/bandit.js',
      format: 'cjs',
      indent: false
    },
    plugins: [resolve(), commonjs(), babel()]
  },
  {
    // ESModule config
    input: 'index.js',
    output: {
      file: 'es/bandit.js',
      format: 'es',
      indent: false
    },
    plugins: [resolve(), commonjs(), babel()]
  },
  {
    // ESModule for browser config
    input: 'index.js',
    output: {
      file: 'es/bandit.mjs',
      format: 'es',
      indent: false
    },
    plugins: [
      resolve(),
      commonjs(),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  },
  {
    // UMD dev config
    input: 'index.js',
    output: {
      file: 'umd/bandit.js',
      format: 'umd',
      indent: false,
      name: 'bandit'
    },
    plugins: [resolve(), babel({ exclude: 'node_modules/**' }), commonjs()]
  },
  {
    // UMD config
    input: 'index.js',
    output: {
      file: 'umd/bandit.min.js',
      format: 'umd',
      indent: false,
      name: 'bandit'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({ exclude: 'node_modules/**' }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  }
];
