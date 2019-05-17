/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A } from '@ember/array';

/**
 * List of having operations
 */
export default A([
  {
    id: 'gt',
    name: 'greater than (>)'
  },
  {
    id: 'gte',
    name: 'greater than or equals (>=)'
  },
  {
    id: 'lt',
    name: 'less than (<)'
  },
  {
    id: 'lte',
    name: 'less than or equals (<=)'
  },
  {
    id: 'eq',
    name: 'equals (=)'
  },
  {
    id: 'neq',
    name: 'not equals (!=)'
  }
]);
