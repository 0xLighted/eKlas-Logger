import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default {
  input: 'web/index.jsx',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'App',
    globals: {
      appwrite: 'Appwrite'  // Only keep appwrite as external
    }
  },
  external: ['appwrite'],  // Only keep appwrite as external
  plugins: [
    resolve({
      extensions: ['.js', '.jsx']
    }),
    commonjs({
      include: /node_modules/  // Make sure to process node_modules
    }),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      extensions: ['.js', '.jsx']
    })
  ]
}