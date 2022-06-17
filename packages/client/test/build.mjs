import { build } from 'esbuild';
import glob from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';
import sh from 'shelljs';
import { setPackageType } from '../set-package-type.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const targetDir = path.join(__dirname, './dist/build');
sh.rm('-rf', targetDir);
setPackageType(targetDir, 'commonjs');

build({
  absWorkingDir: __dirname,
  entryPoints: [
    path.join(__dirname, './setup.ts'),
    ...glob.sync(path.join(__dirname, './tests/**/*'), { nodir: true }),
  ],
  format: 'cjs',
  outdir: path.join(__dirname, 'dist/build'),
  platform: 'neutral',
}).catch(() => process.exit(1));
