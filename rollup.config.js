import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default {
  input: 'web/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'App',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      appwrite: 'Appwrite'
    }
  },
  external: ['react', 'react-dom', 'appwrite'],
  plugins: [
    resolve({
      extensions: ['.js', '.jsx']
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      extensions: ['.js', '.jsx']
    })
  ]
};