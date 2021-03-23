/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { task } from 'ember-concurrency';
import { getOwner } from '@ember/application';
import { getDataSource } from 'navi-data/utils/adapter';
import { taskFor } from 'ember-concurrency-ts';
import type { TaskGenerator } from 'ember-concurrency';
import type NaviDimensionSerializer from 'navi-data/serializers/dimensions/interface';
import type NaviDimensionAdapter from 'navi-data/adapters/dimensions/interface';
import type { DimensionFilter } from 'navi-data/adapters/dimensions/interface';
import type NaviDimensionModel from 'navi-data/models/navi-dimension';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';

export type ServiceOptions = {
  timeout?: number;
  page?: number;
  perPage?: number;
  clientId?: string;
};

export default class NaviDimensionService extends Service {
  /**
   * @param dataSourceType
   * @returns  adapter instance for type
   */
  private adapterFor(dataSourceType: string): NaviDimensionAdapter {
    return getOwner(this).lookup(`adapter:dimensions/${dataSourceType}`);
  }

  /**
   * @param dataSourceType
   * @returns serializer instance for type
   */
  private serializerFor(dataSourceType: string): NaviDimensionSerializer {
    return getOwner(this).lookup(`serializer:dimensions/${dataSourceType}`);
  }

  /**
   * Get all values for a dimension column
   * @param dimension - requested dimension
   * @param options - method options
   */
  @task *all(dimension: DimensionColumn, options?: ServiceOptions): TaskGenerator<NaviDimensionModel[]> {
    const { type: dataSourceType } = getDataSource(dimension.columnMetadata.source);
    const adapter = this.adapterFor(dataSourceType);
    const payload: unknown = yield taskFor(adapter.all).perform(dimension, options);
    return this.serializerFor(dataSourceType).normalize(dimension, payload);
  }

  /**
   * Get dimension value for a filter predicate
   * @param dimension - requested dimension
   * @param predicate - filter criteria
   * @param options - method options
   */
  @task *find(
    dimension: DimensionColumn,
    predicate: DimensionFilter[],
    options?: ServiceOptions
  ): TaskGenerator<NaviDimensionModel[]> {
    const { type: dataSourceType } = getDataSource(dimension.columnMetadata.source);
    const adapter = this.adapterFor(dataSourceType);
    const payload: unknown = yield taskFor(adapter.find).perform(dimension, predicate, options);
    return this.serializerFor(dataSourceType).normalize(dimension, payload);
  }

  /**
   * Get dimension values for a search string
   * @param dimension - requested dimension
   * @param query - query string
   * @param options - method options
   */
  @task *search(
    dimension: DimensionColumn,
    query: string,
    options?: ServiceOptions
  ): TaskGenerator<NaviDimensionModel[]> {
    const { type: dataSourceType } = getDataSource(dimension.columnMetadata.source);
    const adapter = this.adapterFor(dataSourceType);
    const payload: unknown = yield taskFor(adapter.search).perform(dimension, query, options);
    return this.serializerFor(dataSourceType).normalize(dimension, payload);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'navi-dimension': NaviDimensionService;
  }
}
