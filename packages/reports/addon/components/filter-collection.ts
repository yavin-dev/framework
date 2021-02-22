/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { computed } from '@ember/object';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import { dasherize } from '@ember/string';

interface FilterCollectionArgs {
  isCollapsed: boolean;
  request: RequestFragment;
  onUpdateCollapsed?: (isCollapsed: boolean) => void;
  onRemoveFilter(filter: FilterFragment): void;
  onUpdateFilter(filter: FilterFragment): void;
}

export default class FilterCollection extends Component<FilterCollectionArgs> {
  /**
   * Ordered collection of date, metric, and dimension filters from request
   */
  @computed('args.request.filters.[]')
  get filters() {
    const { request } = this.args;
    return [
      ...request.dimensionFilters.map((fragment) => ({ type: this.getFilterType(fragment), fragment })),
      ...request.metricFilters.map((fragment) => ({ type: this.getFilterType(fragment), fragment })),
    ];
  }

  /**
   * Get appropriate filter builder type based on column type
   */
  private getFilterType(filter: FilterFragment) {
    const { type } = filter;
    return dasherize(type);
  }
}
