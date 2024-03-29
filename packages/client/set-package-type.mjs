import fs from 'node:fs';
import path from 'node:path';
import { argv } from 'node:process';

const [_program, _file, dir, type] = argv;

export function setPackageType(dir, type) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const packageJsonPath = path.join(dir, 'package.json');

  fs.writeFileSync(
    packageJsonPath,
    `{
  "type": "${type}"
}`
  );
}

dir && type && ['commonjs', 'module'].includes(type) && setPackageType(dir, type);
