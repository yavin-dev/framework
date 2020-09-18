/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The adapter for the Bard dimension model.
 */

import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';
import { configHost } from '../../utils/adapter';
import { serializeFilters } from '../facts/bard';
import { Filter } from '../facts/interface';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import NaviDimensionAdapter, { DimensionColumn, DimensionFilter } from './interface';
import { ServiceOptions } from 'navi-data/services/navi-dimension';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';

const SUPPORTED_FILTER_OPERATORS = ['in', 'notin', 'startswith', 'contains'];

const SEARCH_TIMEOUT = 30000;

const CLIENT_ID = 'UI';

type LegacyAdapterOptions = {
  dataSourceName?: string;
  clientId?: string;
  timeout?: number;
  page?: number;
  perPage?: number;
};

export type FiliDimensionResponse = {
  rows: Record<string, string>[];
};

export const DefaultField = 'id';

export default class BardDimensionAdapter extends EmberObject implements NaviDimensionAdapter {
  /**
   * @property namespace
   */
  namespace = 'v1';

  @service
  private ajax: TODO;

  @service
  private naviMetadata!: NaviMetadataService;

  /**
   * @property {Array} supportedFilterOperators - List of supported filter operations
   */
  supportedFilterOperators = SUPPORTED_FILTER_OPERATORS;

  _buildUrl(dimension: DimensionColumn, path = 'values') {
    const host = configHost({ dataSourceName: dimension.columnMetadata.source });
    const { namespace } = this;
    const { id: dimensionId } = dimension.columnMetadata;
    return `${host}/${namespace}/dimensions/${dimensionId}/${path}/`;
  }

  _buildFilterQuery(
    dimension: DimensionColumn,
    andQueries: DimensionFilter[]
  ): Record<string, string | number | boolean> {
    const requestV2Filters: Filter[] = andQueries.map(query => {
      const field = dimension.parameters?.field || DefaultField;
      return {
        type: 'dimension',
        field: dimension.columnMetadata.id,
        parameters: { field },
        operator: query.operator || 'in',
        values: query.values || []
      };
    });

    return andQueries.length ? { filters: serializeFilters(requestV2Filters) } : {};
  }

  _find(
    url: string,
    data: Record<string, string | number | boolean>,
    options: ServiceOptions
  ): Promise<FiliDimensionResponse> {
    let clientId = CLIENT_ID;
    let timeout = SEARCH_TIMEOUT;

    if (options) {
      // Support custom clientId header
      if (options.clientId) {
        clientId = options.clientId;
      }

      // Support custom timeout
      if (options.timeout) {
        timeout = options.timeout;
      }

      // pagination
      if (options.page && options.perPage) {
        data.page = options.page;
        data.perPage = options.perPage;
      }
    }

    return this.ajax.request(url, {
      xhrFields: {
        withCredentials: true
      },
      beforeSend(xhr: TODO) {
        xhr.setRequestHeader('clientid', clientId);
      },
      crossDomain: true,
      data,
      timeout
    });
  }

  all(dimension: DimensionColumn, options: ServiceOptions = {}): Promise<FiliDimensionResponse> {
    return this.find(dimension, [], options);
  }

  findById(dimensionName: string, value: string, options: LegacyAdapterOptions) {
    const columnMetadata = this.naviMetadata.getById(
      'dimension',
      dimensionName,
      options.dataSourceName || getDefaultDataSourceName()
    ) as DimensionMetadataModel;
    return this.find({ columnMetadata }, [{ operator: 'in', values: [value] }], options);
  }

  find(
    dimension: DimensionColumn,
    predicate: DimensionFilter[] = [],
    options: ServiceOptions = {}
  ): Promise<FiliDimensionResponse> {
    const url = this._buildUrl(dimension, undefined);
    const data = predicate ? this._buildFilterQuery(dimension, predicate) : {};
    return this._find(url, data, options);
  }

  search(dimension: DimensionColumn, query: string, options: ServiceOptions = {}): Promise<FiliDimensionResponse> {
    const url = this._buildUrl(dimension, 'search');
    const data: Record<string, string> = query ? { query } : {};
    return this._find(url, data, options);
  }
}
