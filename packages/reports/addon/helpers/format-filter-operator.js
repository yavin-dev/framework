/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Formats filter operator
 *
 *  in      -> including
 *  notin   -> excluding
 *  null    -> empty
 *  notnull -> non empty
 *
 */
import { helper as buildHelper } from '@ember/component/helper';
import FilterOperations from 'navi-reports/utils/enums/filter-operations';

export function formatFilterOperator([operator]) {
  return FilterOperations.getById(operator).name;
}

export default buildHelper(formatFilterOperator);
