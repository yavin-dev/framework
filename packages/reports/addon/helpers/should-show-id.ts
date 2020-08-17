/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Helper to determine if we sould see the id field, next to name/description in a list.
 * Now supports arguments list that are shaped for powerSelect grouped content.
 */
import { helper } from '@ember/component/helper';

type Arg = {
  name?: string;
  description?: string;
  groupName?: string;
  options?: Array<Arg>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shouldShowId(_unused: any[], { argument, params }: { argument: Arg; params?: Arg[] }): any {
  if (!Array.isArray(params)) {
    return true;
  }
  const paramArray = params as Array<Arg>;

  //normalized grouped parameters and flatten them out
  const normalizedParams: Arg[] = paramArray
    .map(param => {
      if (param.groupName) {
        return param.options;
      }
      return param;
    })
    .flat() as Arg[];
  const field = argument.name ? 'name' : 'description';
  return normalizedParams.filter(param => param[field] === argument[field]).length > 1;
}

export default helper(shouldShowId);
