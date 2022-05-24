/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Base class for filter builders.
 */
import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import FilterFragment from 'navi-core/models/request/filter';
import { assert } from '@ember/debug';
import RequestFragment from 'navi-core/models/request';
import { Filter, FilterOperator } from '@yavin/client/request';
import { isEqual } from 'lodash-es';
import NaviFormatterService from 'navi-data/services/navi-formatter';
import { inject as service } from '@ember/service';

interface BaseFilterBuilderArgs {
  isRequired: boolean;
  filter: FilterFragment;
  request: RequestFragment;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}

export interface FilterValueBuilder {
  operator: FilterOperator;
  name: string;
  component: string;
  defaultValues?: Filter['values'];
}

export default class BaseFilterBuilder<T extends BaseFilterBuilderArgs = BaseFilterBuilderArgs> extends Component<T> {
  @service naviFormatter!: NaviFormatterService;

  get valueBuilders(): Array<FilterValueBuilder> {
    return [];
  }

  get selectedValueBuilder(): FilterValueBuilder {
    const { operator: operatorId } = this.args.filter;
    const builders = this.valueBuilders.filter(({ operator }) => operator === operatorId);
    assert(
      `Filter operator: '${operatorId}' does not provide a single builder in: ${this.constructor.name}`,
      builders.length === 1
    );
    return builders[0];
  }

  @action
  setOperator(newBuilder: FilterValueBuilder) {
    const {
      selectedValueBuilder,
      args: { filter },
    } = this;
    const changeSet: Partial<FilterFragment> = { operator: newBuilder.operator };

    if (selectedValueBuilder !== newBuilder) {
      if (newBuilder.defaultValues) {
        // use new builder's default values if available
        changeSet.values = newBuilder.defaultValues;
      } else if (selectedValueBuilder.component !== newBuilder.component) {
        // if the components are different clear values in case they are incompatible
        changeSet.values = [];
      }
    }

    // Trim equal properties
    Object.keys(changeSet).forEach((key: keyof typeof changeSet) => {
      if (isEqual(changeSet[key], filter[key])) {
        delete changeSet[key];
      }
    });
    this.args.onUpdateFilter(changeSet);
  }

  @action
  updateParameters(key: string, value: string) {
    this.args.onUpdateFilter({
      parameters: { ...this.args.filter.parameters, [key]: value },
    });
  }

  @computed('args.filter.columnMetadata')
  get columnName() {
    return this.naviFormatter.formatColumnName(this.args.filter.columnMetadata, {}, null);
  }
}
