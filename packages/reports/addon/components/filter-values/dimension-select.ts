/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import CARDINALITY_SIZES from 'navi-data/utils/enums/cardinality-sizes';
import NaviDimensionService from 'navi-data/services/navi-dimension';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import { tracked } from '@glimmer/tracking';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import DimensionMetadataModel, { DimensionColumn } from 'navi-data/models/metadata/dimension';
//@ts-ignore
import { task, timeout } from 'ember-concurrency';
import NaviDimensionModel from 'navi-data/models/navi-dimension';

const SEARCH_DEBOUNCE_TIME = 200;

interface DimensionSelectComponentArgs {
  filter: FilterFragment;
  request: RequestFragment;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}

export default class DimensionSelectComponent extends Component<DimensionSelectComponentArgs> {
  @service
  naviDimension!: NaviDimensionService;

  @service
  naviMetadata!: NaviMetadataService;

  @tracked
  searchTerm?: string;

  get dimensionColumn(): DimensionColumn {
    const { filter } = this.args;
    const columnMetadata = filter.columnMetadata as DimensionMetadataModel;
    const { parameters } = filter;
    return { columnMetadata, parameters };
  }

  get dimensionOptions() {
    if (this.searchTerm !== undefined) {
      return undefined; // we are searching, so only show search results
    }

    const { dimensionColumn } = this;
    if (dimensionColumn.columnMetadata.cardinality === CARDINALITY_SIZES[0]) {
      return this.naviDimension.all(dimensionColumn);
    }
    return undefined;
  }

  @computed('args.filter.values')
  get selectedDimensions(): NaviDimensionModel[] {
    const { dimensionColumn } = this;
    const { values } = this.args.filter;
    if (values !== undefined) {
      return values.map((value) => NaviDimensionModel.create({ value, dimensionColumn }));
    }
    return [];
  }

  @action
  setValues(dimension: NaviDimensionModel[]) {
    const values = dimension.map(({ value }) => value) as (string | number)[];
    this.args.onUpdateFilter({ values });
  }

  @task(function* (this: DimensionSelectComponent, term: string) {
    const searchTerm = term.trim();
    this.searchTerm = searchTerm;

    if (searchTerm) {
      yield timeout(SEARCH_DEBOUNCE_TIME);
      return this.naviDimension.search(this.dimensionColumn, searchTerm);
    }
    return undefined;
  })
  searchDimensionValues!: typeof task;
}
