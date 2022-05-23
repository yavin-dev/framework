/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
//@ts-ignore
import { task, TaskGenerator, timeout } from 'ember-concurrency';
import CARDINALITY_SIZES from '@yavin/client/utils/enums/cardinality-sizes';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import { sortBy } from 'lodash-es';
import { taskFor } from 'ember-concurrency-ts';
import { A } from '@ember/array';
import type NaviDimensionService from 'navi-data/services/navi-dimension';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type RequestFragment from 'navi-core/models/request';
import type FilterFragment from 'navi-core/models/request/filter';
import type DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';
import type NaviDimensionResponse from 'navi-data/models/navi-dimension-response';
import type ClientInjector from 'navi-data/services/client-injector';

const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_DEBOUNCE_OFFLINE_MS = 100;

interface DimensionSelectComponentArgs {
  filter: FilterFragment;
  request: RequestFragment;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}

interface NaviDimMeta {
  manualInputEntry?: boolean;
}
export class DimModelWrapper {
  model: NaviDimensionModel;
  meta: NaviDimMeta;
  constructor(model: NaviDimensionModel, meta: NaviDimMeta = {}) {
    this.model = model;
    this.meta = meta;
  }

  isEqual(other: unknown): boolean {
    return other instanceof DimModelWrapper && this.model.isEqual(other.model);
  }
}

function isNumeric(num: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- isNan should accept any
  return !isNaN(num as any);
}
function isNumericDimensionArray(arr: DimModelWrapper[]): boolean {
  return arr.every((d) => isNumeric(d.model.value as string));
}

export default class DimensionSelectComponent extends Component<DimensionSelectComponentArgs> {
  @service declare naviDimension: NaviDimensionService;

  @service declare naviMetadata: NaviMetadataService;

  @service declare clientInjector: ClientInjector;

  @tracked
  searchTerm?: string;

  @tracked
  dimensionValues?: Promise<DimModelWrapper[]>;

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

  get selectedDimensions(): DimModelWrapper[] {
    const { dimensionColumn } = this;
    const { values } = this.args.filter;
    if (values !== undefined) {
      return values.map(
        (value) =>
          new DimModelWrapper(new NaviDimensionModel(this.clientInjector, { value, dimensionColumn }), {
            manualInputEntry: undefined,
          })
      );
    }
    return [];
  }

  get isSmallCardinality() {
    const { dimensionColumn } = this;
    return dimensionColumn.columnMetadata.cardinality === CARDINALITY_SIZES[0];
  }

  @action
  setValues(dimension: DimModelWrapper[]) {
    const values = dimension.map(({ model }) => model.value) as (string | number)[];
    this.args.onUpdateFilter({ values });
  }

  @action
  bulkImport(newValues: string[]) {
    const current = this.args.filter.values;
    const values = A([...current, ...newValues])
      .uniq()
      .toArray();
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
        .then((r) => r.values.map((value) => new DimModelWrapper(value, { manualInputEntry: false })))
        .then((dimensions) => {
          if (isNumericDimensionArray(dimensions)) {
            return sortBy(dimensions, [(d) => Number(d.model.value)]);
          }
          return sortBy(dimensions, ['model.value']);
        });
    }
  }

  /**
   * Searches for dimensions containing search term (locally if all results are available)
   * @param term Search term to filter by
   * @returns list of matching dimension models
   */
  @task({ restartable: true })
  *searchDimensionValues(term: string): TaskGenerator<DimModelWrapper[] | undefined> {
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

    const dimensionResponseModel = dimensionResponse.values.map(
      (values) => new DimModelWrapper(values, { manualInputEntry: false })
    );

    if (dimensionResponse.values.map((each) => each.value).includes(searchTerm)) {
      return dimensionResponseModel;
    }

    const value = searchTerm as string | number;
    const manualQuery = new NaviDimensionModel(this.clientInjector, {
      value,
      dimensionColumn,
    });

    const manualModel = new DimModelWrapper(manualQuery, { manualInputEntry: true });
    return [manualModel, ...dimensionResponseModel];
  }
}
