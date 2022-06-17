import { build } from 'esbuild';
import glob from 'glob';
import browserslist from 'browserslist';
import { esbuildPluginBrowserslist, resolveToEsbuildTarget } from 'esbuild-plugin-browserslist';
import graphqlLoaderPlugin from '@luckycatfactory/esbuild-graphql-loader/lib/index.mjs';
import { argv } from 'node:process';
import sh from 'shelljs';
import { setPackageType } from './set-package-type.mjs';

const [_program, _file, type, watchFlag] = argv;

const watch = watchFlag === '--watch';
console.log('isWatching', watch);

const targetDir = `lib/${type}`;
sh.rm('-rf', targetDir);
const moduleType = { cjs: 'commonjs', esm: 'module' }[type];
setPackageType(targetDir, moduleType);

build({
  entryPoints: glob.sync('./src/**/*', { nodir: true }),
  format: type,
  outdir: targetDir,
  platform: 'neutral',
  watch,
  plugins: [
    graphqlLoaderPlugin(),
    esbuildPluginBrowserslist(browserslist(null, { config: './.browserslistrc' }), {
      printUnknownTargets: false,
    }),
  ],
}).catch(() => process.exit(1));
