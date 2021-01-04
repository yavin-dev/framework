/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Helper object for building request object used by fact service
 */
import { RequestV2, Parameters, FilterOperator, SortDirection } from 'navi-data/adapters/facts/interface';
import { Grain } from 'navi-data/utils/date';
import { ColumnType } from 'navi-data/models/metadata/column';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';
import { nanoid } from 'nanoid';
import { assert } from '@ember/debug';

/**
 * Utility Class for building a request V2
 */
export default class RequestV2Builder {
  /**
   * @property The request being built
   */
  private request: RequestV2;

  /**
   * @param request Optional request to use as base.
   */
  constructor(request?: RequestV2) {
    if (!request) {
      this.request = {
        filters: [],
        columns: [],
        table: '',
        dataSource: getDefaultDataSourceName(),
        sorts: [],
        limit: null,
        requestVersion: '2.0'
      };
    } else {
      this.request = JSON.parse(JSON.stringify(request));
    }
  }

  /**
   * Adds a column to the request
   * @param type - metric, dimension, timeDimension
   * @param field - name of the metric/dimension or timeDimension
   * @param parameters - Dictionary of parameters
   * @param alias - Optoinal Display name for the field
   * @param cid - column id, generated if not given
   */
  addColumn(type: ColumnType, field: string, parameters: Parameters, alias?: string, cid?: string): RequestV2Builder {
    this.request.columns.push({
      type,
      field,
      parameters,
      ...(alias ? { alias } : null),
      cid: cid ?? nanoid(10)
    });
    return this;
  }

  /**
   * Convenience for adding a metric column
   * @param metricName Name of metric
   * @param parameters Dictionary of parameters
   */
  addMetric(metricName: string, parameters: Parameters = {}): RequestV2Builder {
    this.addColumn('metric', metricName, parameters);
    return this;
  }

  /**
   * Convenience for adding a dimension column
   * @param dimensionName Name of dimension
   * @param parameters Dictionary of parameters
   */
  addDimension(dimensionName: string, parameters: Parameters = {}): RequestV2Builder {
    this.addColumn('dimension', dimensionName, parameters);
    return this;
  }

  /**
   * Adds a filter to the request
   * @param type metric, dimension, or timeDimension
   * @param field field name
   * @param parameters dictionary of parameters
   * @param operator operator
   * @param values array of values for the filter
   */
  addFilter(
    type: ColumnType,
    field: string,
    parameters: Parameters,
    operator: FilterOperator,
    values: (string | number | boolean)[]
  ): RequestV2Builder {
    this.request.filters.push({
      type,
      field,
      parameters,
      operator,
      values
    });
    return this;
  }

  /**
   * Adds a row limit to request
   * @param limit number of max rows
   */
  setLimit(limit: number): RequestV2Builder {
    this.request.limit = limit;
    return this;
  }

  /**
   * Adds sort to the request
   * @param type metric,dimension or timeDimension
   * @param field field name to sort by
   * @param parameters Dictionary of parameters
   * @param direction asc/desc
   */
  addSort(type: ColumnType, field: string, parameters: Parameters, direction: SortDirection): RequestV2Builder {
    this.request.sorts.push({
      type,
      field,
      parameters,
      direction
    });
    return this;
  }

  /**
   * Adds table name to request
   * @param name name of the table
   */
  setTable(name: string): RequestV2Builder {
    this.request.table = name;
    return this;
  }

  /**
   * Allows specifies the datasource
   * @param dataSource name of the datasource
   */
  setDataSource(dataSource: string): RequestV2Builder {
    this.request.dataSource = dataSource;
    return this;
  }

  /**
   * Convenience method for adding an interval filter
   * @param grain 'day','week','month' etc... whatever your datasource supports
   * @param start Period, datestring or macro
   * @param end Period, datestring or macro
   */
  addTimeRangeFilter(grain: Grain, start: string, end: string): RequestV2Builder {
    const table = this.request.table;
    assert('Set the table before you set the interval', table.length !== 0);

    this.addColumn('timeDimension', `${table}.dateTime`, { grain }).addFilter(
      'timeDimension',
      `${table}.dateTime`,
      { grain },
      'bet',
      [start, end]
    );

    return this;
  }

  /**
   * Returns the built request
   */
  build() {
    return this.request;
  }
}
