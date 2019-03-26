import { helper } from '@ember/component/helper';
import { A as EmberArray } from '@ember/array';

export function emberArray(params) {
  // slice params to avoid mutating the provided params
  return EmberArray(params.slice());
}

export default helper(emberArray);
