/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Base class for filter builders.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import { computed } from '@ember/object';
import { A as arr } from '@ember/array';
import EmberArray from '@ember/array';

interface BaseFilterBuilderArgs {
  filter: FilterFragment;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}

export type FilterOperators = {
  id: string;
  name: string;
  valuesComponent: string;
};

export type FilterConfig = {
  subject: FilterFragment;
  operator: string;
  values: EmberArray<string | number>;
  validations?: TODO;
};

export default class BaseFilterBuilder extends Component<BaseFilterBuilderArgs> {
  get displayName() {
    //Rebase
    return this.args.filter.displayName;
  }

  get supportedOperators(): Array<FilterOperators> {
    return [];
  }

  get selectedOperator(): FilterOperators | undefined {
    return this.supportedOperators.find(({ id }) => id === this.args.filter.operator);
  }

  @computed('selectedOperator', 'args.filter.{operator,validations,values.[]}')
  get filter() {
    const { values, validations } = this.args.filter;
    const { selectedOperator: operator } = this;

    return {
      subject: this.args.filter,
      operator,
      values: arr(values),
      validations
    };
  }

  @action
  setOperator(operatorObject: FilterOperators) {
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
