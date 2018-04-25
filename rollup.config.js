import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/Gistore.js',
    format: 'cjs',
    name: 'Gistore',
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
