/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A get helper that only goes one level deep. This is necessary for keys that contain "."
 * e.g.
 * obj = { 'foo.bar': 'baz' };
 * {{get-shallow obj "foo.bar"}}
 * -> 'baz'
 * {{get obj "foo.bar"}}
 * -> undefined
 */
import { helper } from '@ember/component/helper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Params = [Dict<any>, string];
export function getShallow(params: Params) {
  const [obj, key] = params;
  return obj[key];
}

export default helper(getShallow);
