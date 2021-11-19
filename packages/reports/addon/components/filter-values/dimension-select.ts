/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
//@ts-ignore
import { task, TaskGenerator, timeout } from 'ember-concurrency';
import CARDINALITY_SIZES from 'navi-data/utils/enums/cardinality-sizes';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import { sortBy } from 'lodash-es';
import { taskFor } from 'ember-concurrency-ts';
import type NaviDimensionService from 'navi-data/services/navi-dimension';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type RequestFragment from 'navi-core/models/request';
import type FilterFragment from 'navi-core/models/request/filter';
import type DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';
import type NaviDimensionResponse from 'navi-data/models/navi-dimension-response';

const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_DEBOUNCE_OFFLINE_MS = 100;

interface DimensionSelectComponentArgs {
  filter: FilterFragment;
  request: RequestFragment;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}

interface ManualInput extends NaviDimensionModel {
  manualInputEntry: boolean;
}

function isNumeric(num: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- isNan should accept any
  return !isNaN(num as any);
}
function isNumericDimensionArray(arr: NaviDimensionModel[]): boolean {
  return arr.every((d) => isNumeric(d.value as string));
}

export default class DimensionSelectComponent extends Component<DimensionSelectComponentArgs> {
  @service declare naviDimension: NaviDimensionService;

  @service declare naviMetadata: NaviMetadataService;

  @tracked
  searchTerm?: string;

  @tracked
  dimensionValues?: Promise<NaviDimensionModel[]>;

  get dimensionColumn(): DimensionColumn {
    const { filter } = this.args;
    const columnMetadata = filter.columnMetadata as DimensionMetadataModel;
    const { parameters } = filter;
    return { columnMetadata, parameters };
  }

  get options() {
    if (this.searchTerm !== undefined) {
      return undefined; // we are searching, so only show search results
    }
    return this.dimensionValues;
  }

  get selectedDimensions(): NaviDimensionModel[] {
    const { dimensionColumn } = this;
    const { values } = this.args.filter;
    if (values !== undefined) {
      const dimensionModelFactory = getOwner(this).factoryFor('model:navi-dimension');
      return values.map((value) => dimensionModelFactory.create({ value, dimensionColumn }));
    }
    return [];
  }

  get isSmallCardinality() {
    const { dimensionColumn } = this;
    return dimensionColumn.columnMetadata.cardinality === CARDINALITY_SIZES[0];
  }

  @action
  setValues(dimension: NaviDimensionModel[]) {
    const values = dimension.map(({ value }) => value) as (string | number)[];
    this.args.onUpdateFilter({ values });
  }

  /**
   * Fetches dimension options once when the dropdown is opened
   */
  @action
  fetchDimensionOptions(): void {
    const { dimensionColumn } = this;
    if (this.isSmallCardinality) {
      this.dimensionValues = taskFor(this.naviDimension.all)
        .perform(dimensionColumn)
        .then((r) => r.values)
        .then((dimensions) => {
          if (isNumericDimensionArray(dimensions)) {
            return sortBy(dimensions, [(d) => Number(d.value)]);
          }
          return sortBy(dimensions, ['value']);
        });
    }
  }

  /**
   * Searches for dimensions containing search term (locally if all results are available)
   * @param term Search term to filter by
   * @returns list of matching dimension models
   */
  @task({ restartable: true })
  *searchDimensionValues(term: string): TaskGenerator<NaviDimensionModel[] | undefined> {
    const { dimensionColumn } = this;
    const searchTerm = term.trim();
    this.searchTerm = searchTerm;
    if (!searchTerm) {
      return undefined;
    }

    yield timeout(this.isSmallCardinality ? SEARCH_DEBOUNCE_OFFLINE_MS : SEARCH_DEBOUNCE_MS);
    const dimensionResponse: NaviDimensionResponse = yield taskFor(this.naviDimension.search).perform(
      this.dimensionColumn,
      searchTerm
    );
    if (dimensionResponse.values.map((each) => each.value).includes(searchTerm)) {
      return dimensionResponse.values;
    }

    const dimensionModelFactory = getOwner(this).factoryFor('model:navi-dimension');
    const value = searchTerm as string | number;
    const manualQuery = dimensionModelFactory.create({
                  value,
        	  dimensionColumn,
        	  manualInputEntry: true
      	        }) as ManualInput;

    return [manualQuery, ...dimensionResponse.values];
  }
}
