/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import type DashboardModel from 'navi-core/models/dashboard';
import type FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import type Store from '@ember-data/store';

interface Args {
  dashboard: DashboardModel;
  onRemoveFilter(filter: FilterFragment): void;
  onUpdateFilter(filter: FilterFragment): void;
  onAddFilter(): void;
}

export default class DashboardFiltersComponent extends Component<Args> {
  @service
  declare store: Store;

  @tracked
  isCollapsed = true;

  @tracked
  isAddingMode = false;

  @computed('args.dashboard.filters.[]')
  get request() {
    return this.store.createFragment('bard-request-v2/request', {
      table: null,
      columns: [],
      filters: (this.args.dashboard.filters || []).map((filter) => {
        const newFilter = this.store.createFragment('bard-request-v2/fragments/filter', {
          field: filter.field,
          parameters: filter.parameters,
          type: filter.type,
          operator: filter.operator,
          values: filter.values,
          source: filter.source,
        });
        return newFilter;
      }),
      sorts: [],
      limit: null,
      dataSource: null,
      requestVersion: '2.0',
    });
  }
}
