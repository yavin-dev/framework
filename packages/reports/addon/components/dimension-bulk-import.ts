/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <DimensionBulkImport
 *      @dimension={{@dimensionToImport}}
 *      @query={{@query}}
 *      @onSelectValues={{this.selectValues}}
 *      @onCancel={{this.cancel}}
 *   />
 */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { helper } from '@ember/component/helper';
import { taskFor } from 'ember-concurrency-ts';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type { TaskGenerator, TaskInstance } from 'ember-concurrency';
import type NaviDimensionService from 'navi-data/services/navi-dimension';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { DimensionColumn } from '@yavin/client/models/metadata/dimension';
import type FragmentFactory from 'navi-core/services/fragment-factory';
import type FilterFragment from 'navi-core/models/request/filter';
import type NaviDimensionResponse from '@yavin/client/models/navi-dimension-response';

interface Args {
  dimension: DimensionColumn;
  query: string;
  onSelectValues(values: string[]): void;
  onCancel(): void;
}

const BULK_IMPORT_DELIMITER = ',';

export default class DimensionBulkImportComponent extends Component<Args> {
  @service
  declare naviDimension: NaviDimensionService;

  @service
  declare naviMetadata: NaviMetadataService;

  @service
  declare fragmentFactory: FragmentFactory;

  @tracked
  validValues: unknown[] = [];
  @tracked
  validValuesTask?: TaskInstance<unknown[]>;

  @tracked
  invalidValues: unknown[] = [];
  @tracked
  invalidValuesTask?: TaskInstance<unknown[]>;

  @tracked query = this.args.query;

  /**
   * unique list of non-empty values to search for
   */
  get trimmedQueryIds() {
    //Remove empty strings
    const queryIds = this.query
      .split(BULK_IMPORT_DELIMITER)
      .map((s) => s.trim())
      .filter((key) => key.length > 0);
    // filter duplicates
    return [...new Set(queryIds)];
  }

  get valueLookup(): TaskInstance<NaviDimensionResponse> {
    return taskFor(this.naviDimension.find).perform(this.args.dimension, [
      { operator: 'in', values: this.trimmedQueryIds },
    ]);
  }

  makeFilter = helper(([values]: [FilterFragment['values']]) => {
    const { dimension } = this.args;
    const { columnMetadata, parameters = {} } = dimension;
    return this.fragmentFactory.createFilter(
      columnMetadata.metadataType,
      columnMetadata.source,
      columnMetadata.id,
      parameters,
      'in',
      values
    );
  });

  @task({ restartable: true })
  *fetchOptions() {
    yield timeout(250);
    this.validValuesTask = taskFor(this.validTask).perform();
    this.invalidValuesTask = taskFor(this.invalidTask).perform();
  }

  @action
  updateValues(key: 'validValues' | 'invalidValues', { values }: Partial<FilterFragment>) {
    this[key] = values as string[];
  }

  @task
  *validTask(): TaskGenerator<unknown[]> {
    const response: NaviDimensionResponse = yield this.valueLookup;
    const allValid = new Set(response.values.map((v) => v.value));
    this.validValues = this.trimmedQueryIds.filter((id) => allValid.has(id));
    return this.validValues;
  }

  @task
  *invalidTask(): TaskGenerator<unknown[]> {
    const response: NaviDimensionResponse = yield this.valueLookup;
    const allValid = new Set(response.values.map((v) => v.value));
    this.invalidValues = this.trimmedQueryIds.filter((id) => !allValid.has(id));
    return this.invalidValues;
  }
}
