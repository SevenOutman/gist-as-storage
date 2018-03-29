import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/GAS.js',
    format: 'cjs',
    name: 'GAS',
    sourcemap: true,
  },
  external: [
    'babel-polyfill',
    'github-api',
    'lodash.isequal',
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
}
