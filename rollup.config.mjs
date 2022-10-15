// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs'
    }, {
      file: 'dist/index.es.js',
      format: 'es'
    }
  ],
  plugins: [
    typescript({ compilerOptions: { module: 'esnext' } }),
    commonjs({ extensions: ['.js', '.ts'] }) // the ".ts" extension is required
  ]
};
