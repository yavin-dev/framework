/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Base class for filter builders.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import EmberArray from '@ember/array';
import { assert } from '@ember/debug';
import { FilterOperator } from 'navi-data/addon/adapters/facts/interface';

interface BaseFilterBuilderArgs {
  filter: FilterFragment;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}

export type FilterBuilderOperators = {
  id: FilterOperator;
  name: string;
  valuesComponent: string;
};

export type FilterConfig = {
  subject: FilterFragment;
  operator: FilterBuilderOperators;
  values: EmberArray<string | number>;
  validations?: TODO;
};

export default class BaseFilterBuilder extends Component<BaseFilterBuilderArgs> {
  get supportedOperators(): Array<FilterBuilderOperators> {
    return [];
  }

  get selectedOperator(): FilterBuilderOperators {
    const operator = this.supportedOperators.find(({ id }) => id === this.args.filter.operator);
    assert(`Filter operator: '${this.args.filter.operator}' is not supported in: ${this.constructor.name}`, operator);
    return operator;
  }

  @action
  setOperator(operatorObject: FilterBuilderOperators) {
    const changeSet = { operator: operatorObject.id };
    /*
     * Clear values in case they are incompatible with new operator,
     * unless operators share valuesComponent
     */
    if (this.selectedOperator?.valuesComponent !== operatorObject.valuesComponent) {
      Object.assign(changeSet, { values: [] });
    }
    this.args.onUpdateFilter(changeSet);
  }

  @action
  updateParameters(key: string, value: string) {
    this.args.onUpdateFilter({
      parameters: { ...this.args.filter.parameters, [key]: value }
    });
  }
}
