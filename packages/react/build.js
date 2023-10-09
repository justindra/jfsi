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

await build({
  ...shared,
  format: 'esm',
  outfile: './dist/index.js',
  target: ['esnext', 'node16'],
  loader: {
    '.png': 'dataurl',
  },
});

[
  'utils.ts',
  'hooks.ts',
  'alerts.tsx',
  'button.tsx',
  'empty.tsx',
  'icons.tsx',
  'modal.tsx',
].forEach(async (entryFile) => {
  // Replace .ts or .tsx with .js
  const outfile = entryFile.replace(/\.tsx?$/, '.js');

  await build({
    ...shared,
    entryPoints: [`src/${entryFile}`],
    format: 'esm',
    outfile: `./dist/${outfile}`,
    target: ['esnext', 'node16'],
    loader: {
      '.png': 'dataurl',
    },
  });
});
