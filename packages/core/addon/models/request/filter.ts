/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import BaseFragment from '../request/base';
import { Filter } from 'navi-data/adapters/facts/interface';
import Interval from '@yavin/client/utils/classes/interval';

export function isIntervalValid(values: Filter['values'], filter: FilterFragment) {
  if (filter.type === 'timeDimension' && filter.operator === 'bet') {
    const [start, end] = values;
    try {
      Interval.parseFromStrings(`${start}`, `${end}`);
      return true;
    } catch (e) {
      return false;
    }
  }
  return true;
}

const Validations = buildValidations({
  operator: validator('presence', {
    presence: true,
    message: 'The `operator` filter field cannot be empty',
  }),
  values: [
    validator('collection', {
      collection: true,
      message() {
        const { field } = this.model;
        return `${field} filter must be a collection`;
      },
    }),
    validator('inline', {
      validate(values: Filter['values'], _options: unknown, filter: FilterFragment) {
        const isValid = isIntervalValid(values, filter);
        if (!isValid) {
          const filterName = filter.columnMetadata?.name ?? filter.field;
          return `The '${filterName}' filter has invalid interval ${JSON.stringify(values)}`;
        }
        return isValid;
      },
    }),
  ],
});

/**
 * @augments {BaseFragment}
 */
export default class FilterFragment extends BaseFragment.extend(Validations) implements Filter {
  @attr('string', { defaultValue: 'in' })
  operator!: Filter['operator'];

  @attr({ defaultValue: () => [] })
  values!: Filter['values'];
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    'request/filter': FilterFragment;
  }
}
