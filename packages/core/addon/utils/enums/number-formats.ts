/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A } from '@ember/array';

/**
 * List of number formats
 */
export default A([
  { name: 'Number', format: '0,0.00' },
  { name: 'Decimal', format: '0.000' },
  { name: 'Nice Number', format: '0.0a' },
  { name: 'Money', format: '$0,0[.]00' },
]);
