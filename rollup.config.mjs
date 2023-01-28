// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: ['src/index.ts', "src/decorator.ts", "src/errors.ts"],
  output: [
    {
      dir: "dist",
      format: 'cjs'
    }
  ],
  plugins: [
    typescript({ compilerOptions: { module: 'esnext' } }),
    commonjs({ extensions: ['.js', '.ts'] }) // the ".ts" extension is required
  ]
};
