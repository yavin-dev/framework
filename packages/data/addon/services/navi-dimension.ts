/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import NaviDimensionSerializer from 'navi-data/serializers/dimensions/interface';
import NaviDimensionAdapter, { DimensionColumn, DimensionFilter } from 'navi-data/adapters/dimensions/interface';
import { getOwner } from '@ember/application';
import { getDataSource } from 'navi-data/utils/adapter';
import NaviDimensionModel from 'navi-data/models/navi-dimension';

export type ServiceOptions = {
  timeout?: number;
  page?: number;
  perPage?: number;
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
  async all(dimension: DimensionColumn, options?: ServiceOptions): Promise<NaviDimensionModel[]> {
    const { type: dataSourceType } = getDataSource(dimension.columnMetadata.source);
    const payload = await this.adapterFor(dataSourceType).all(dimension, options);
    return this.serializerFor(dataSourceType).normalize(dimension, payload);
  }

  /**
   * Get dimension value for a filter predicate
   * @param dimension - requested dimension
   * @param predicate - filter criteria
   * @param options - method options
   */
  async find(
    dimension: DimensionColumn,
    predicate: DimensionFilter[],
    options?: ServiceOptions
  ): Promise<NaviDimensionModel[]> {
    const { type: dataSourceType } = getDataSource(dimension.columnMetadata.source);
    const payload = await this.adapterFor(dataSourceType).find(dimension, predicate, options);
    return this.serializerFor(dataSourceType).normalize(dimension, payload);
  }

  /**
   * Get dimension values for a search string
   * @param dimension - requested dimension
   * @param query - query string
   * @param options - method options
   */
  async search(dimension: DimensionColumn, query: string, options?: ServiceOptions): Promise<NaviDimensionModel[]> {
    const { type: dataSourceType } = getDataSource(dimension.columnMetadata.source);
    const payload = await this.adapterFor(dataSourceType).search(dimension, query, options);
    return this.serializerFor(dataSourceType).normalize(dimension, payload);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'navi-dimension': NaviDimensionService;
  }
}
