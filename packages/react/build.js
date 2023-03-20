// Reference: https://github.com/souporserious/bundling-typescript-with-esbuild-for-npm

import { build } from 'esbuild';
import packageConfig from './package.json' assert { type: 'json' };
const { dependencies } = packageConfig;

const entryFile = 'src/index.tsx';
const shared = {
  bundle: true,
  entryPoints: [entryFile],
  external: Object.keys(dependencies),
  logLevel: 'info',
  minify: true,
  sourcemap: true,
};

build({
  ...shared,
  format: 'esm',
  outfile: './dist/index.esm.js',
  target: ['esnext', 'node16'],
  loader: {
    '.png': 'file',
  },
});
