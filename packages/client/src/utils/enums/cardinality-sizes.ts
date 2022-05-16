/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

const CARDINALITY_SIZES = <const>['SMALL', 'MEDIUM', 'LARGE'];
export default CARDINALITY_SIZES;

export type Cardinality = typeof CARDINALITY_SIZES[number];
