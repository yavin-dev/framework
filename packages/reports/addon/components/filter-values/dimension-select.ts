/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { computed, action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
//@ts-ignore
import { task, timeout } from 'ember-concurrency';
import CARDINALITY_SIZES from 'navi-data/utils/enums/cardinality-sizes';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import type NaviDimensionService from 'navi-data/services/navi-dimension';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type RequestFragment from 'navi-core/models/bard-request-v2/request';
import type FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import type DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';
import type { IndexedOptions } from '../power-select-collection-options';
import { sortBy } from 'lodash-es';

const SEARCH_DEBOUNCE_TIME = 250;

interface DimensionSelectComponentArgs {
  filter: FilterFragment;
  request: RequestFragment;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}

function isNumeric(num: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- isNan should accept any
  return !isNaN(num as any);
}
function isNumericDimensionArray(arr: IndexedOptions<NaviDimensionModel>[]): boolean {
  return arr.every((d) => isNumeric(d.option.value as string));
}

export default class DimensionSelectComponent extends Component<DimensionSelectComponentArgs> {
  @service declare naviDimension: NaviDimensionService;

  @service declare naviMetadata: NaviMetadataService;

  @tracked
  searchTerm?: string;

  @computed('args.filter.{columnMetadata,parameters}')
  get dimensionColumn(): DimensionColumn {
    const { filter } = this.args;
    const columnMetadata = filter.columnMetadata as DimensionMetadataModel;
    const { parameters } = filter;
    return { columnMetadata, parameters };
  }

  @computed('searchTerm', 'dimensionColumn.{id,columnMetadata.cardinality}')
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

  @computed('args.filter.values', 'dimensionColumn')
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

  @action
  sortValues(dimensions: IndexedOptions<NaviDimensionModel>[]) {
    if (isNumericDimensionArray(dimensions)) {
      return sortBy(dimensions, [(d) => Number(d.option.value)]);
    }
    return sortBy(dimensions, ['option.value']);
  }

  @(task(function* (this: DimensionSelectComponent, term: string) {
    const searchTerm = term.trim();
    this.searchTerm = searchTerm;

    if (searchTerm) {
      yield timeout(SEARCH_DEBOUNCE_TIME);
      return this.naviDimension.search(this.dimensionColumn, searchTerm);
    }
    return undefined;
  }).restartable())
  searchDimensionValues!: typeof task;
}
