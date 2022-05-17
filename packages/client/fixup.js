import fs from 'node:fs';

const packages = { cjs: 'lib/cjs/package.json', esm: 'lib/esm/package.json' };

if (!fs.existsSync('lib')) {
  fs.mkdirSync('lib');
}
if (!fs.existsSync('lib/cjs')) {
  fs.mkdirSync('lib/cjs');
}
if (!fs.existsSync('lib/esm')) {
  fs.mkdirSync('lib/esm');
}

fs.writeFileSync(
  packages.cjs,
  `{
  "type": "commonjs"
}`
);

fs.writeFileSync(
  packages.esm,
  `{
  "type": "module"
}`
);
