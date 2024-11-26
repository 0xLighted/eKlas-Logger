import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default {
  input: 'web/index.jsx',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    name: 'App',
    // Ensure proper module wrapping
    banner: '(function (React, ReactDOM, Appwrite) {',
    footer: '})(window.React, window.ReactDOM, window.Appwrite);'
  },
  plugins: [
    resolve({
      extensions: ['.js', '.jsx']
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      extensions: ['.js', '.jsx']
    })
  ]
};