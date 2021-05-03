/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The adapter for the Bard dimension model.
 */
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { configHost, getDefaultDataSourceName } from 'navi-data/utils/adapter';
import { task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import type { TaskGenerator } from 'ember-concurrency';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type NaviDimensionAdapter from './interface';
import type { DimensionFilter } from './interface';
import type { ServiceOptions } from 'navi-data/services/navi-dimension';
import type DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';
import type { AjaxServiceClass } from 'ember-ajax/services/ajax';

const SEARCH_TIMEOUT = 30000;

type LegacyAdapterOptions = {
  dataSourceName?: string;
  clientId?: string;
  timeout?: number;
  page?: number;
  perPage?: number;
};

export type FiliDimensionResponse = {
  rows: Record<string, string>[];
  meta?: Record<string, unknown>;
};

export default class PrometheusDimensionAdapter extends EmberObject implements NaviDimensionAdapter {
  @service
  private declare ajax: AjaxServiceClass;

  @service
  private declare naviMetadata: NaviMetadataService;

  _find(
    url: string,
    data: Record<string, string | number | boolean>,
    _options: ServiceOptions
  ): Promise<FiliDimensionResponse> {
    let timeout = SEARCH_TIMEOUT;

    return this.ajax.request(url, {
      crossDomain: true,
      data,
      timeout,
    });
  }

  @task *all(dimension: DimensionColumn, options: ServiceOptions = {}): TaskGenerator<FiliDimensionResponse> {
    return yield taskFor(this.find).perform(dimension, [], options);
  }

  @task *findById(
    dimensionName: string,
    value: string,
    options: LegacyAdapterOptions
  ): TaskGenerator<FiliDimensionResponse> {
    const columnMetadata = this.naviMetadata.getById(
      'dimension',
      dimensionName,
      options.dataSourceName || getDefaultDataSourceName()
    ) as DimensionMetadataModel;
    return yield taskFor(this.find).perform({ columnMetadata }, [{ operator: 'in', values: [value] }], options);
  }

  @task *find(
    dimension: DimensionColumn,
    _predicate: DimensionFilter[] = [],
    _options: ServiceOptions = {}
  ): TaskGenerator<FiliDimensionResponse> {
    const host = configHost({ dataSourceName: dimension.columnMetadata.source });
    const url = `${host}/api/v1/label/${dimension.columnMetadata.id}/values`;
    return yield this.ajax.request(url, {
      timeout: 1000,
    });
  }

  @task *search(
    dimension: DimensionColumn,
    query: string,
    _options: ServiceOptions = {}
  ): TaskGenerator<FiliDimensionResponse> {
    const filters: DimensionFilter[] = query ? [{ operator: 'contains', values: [query] }] : [];
    return yield taskFor(this.find).perform(dimension, filters);
  }
}
