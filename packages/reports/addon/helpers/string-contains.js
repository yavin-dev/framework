import { helper as buildHelper } from '@ember/component/helper';

export function stringContains(source, substring) {
  return source.includes(substring);
}

export default buildHelper(args => stringContains(...args));
