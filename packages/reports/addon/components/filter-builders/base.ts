/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Base class for filter builders.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import { assert } from '@ember/debug';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { FilterOperator } from 'navi-data/adapters/facts/interface';

interface BaseFilterBuilderArgs {
  filter: FilterFragment;
  request: RequestFragment;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}

export interface FilterBuilderOperators {
  id: FilterOperator;
  name: string;
  valuesComponent: string;
}

export default class BaseFilterBuilder<T extends BaseFilterBuilderArgs = BaseFilterBuilderArgs> extends Component<T> {
  get supportedOperators(): Array<FilterBuilderOperators> {
    return [];
  }

  get selectedOperator(): FilterBuilderOperators {
    const { operator: operatorId } = this.args.filter;
    const operator = this.supportedOperators.find(({ id }) => id === operatorId);
    assert(`Filter operator: '${operatorId}' is not supported in: ${this.constructor.name}`, operator);
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
