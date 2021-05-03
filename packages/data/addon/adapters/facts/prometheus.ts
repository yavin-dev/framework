/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import NaviFactAdapter, { FactAdapterError, Filter, FilterOperator } from './interface';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import moment from 'moment';
import { configHost } from 'navi-data/utils/adapter';
import Interval from 'navi-data/utils/classes/interval';
import type { RequestV1, RequestOptions, AsyncQueryResponse, RequestV2 } from './interface';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { TaskGenerator } from 'ember-concurrency';
import type { AjaxServiceClass } from 'ember-ajax/services/ajax';
import type { Grain } from 'navi-data/utils/date';

export default class PrometheusFactsAdapter extends EmberObject implements NaviFactAdapter {
  @service
  declare naviMetadata: NaviMetadataService;

  @service
  private declare ajax: AjaxServiceClass;

  private filterBuilders: Record<FilterOperator, (field: string, value: Filter['values']) => string> = {
    eq: (f, v) => `${f}==('${v[0]}')`,
    neq: (f, v) => `${f}!=('${v[0]}')`,
    in: (f, v) => {
      return v.length === 1 ? `${f}="${v[0]}"` : `${f}=~"(${v.join(',')})"`;
    },
    ini: (f, v) => ``,
    notin: (f, v) => {
      return v.length === 1 ? `${f}!="${v[0]}"` : `${f}!~"(${v.join(',')})"`;
    },
    contains: (f, v) => ``,
    isnull: (f, v) => ``,
    lte: (f, v) => ``,
    gte: (f, v) => ``,
    lt: (f, v) => ``,
    gt: (f, v) => ``,
    bet: (f, v) => ``,
    nbet: (f, v) => ``,
  };

  /**
   * @param _request
   * @param _options
   */
  urlForFindQuery(_request: RequestV2, _options: RequestOptions): string {
    return '';
  }

  /**
   * @param _request
   * @param _options
   */
  @task *urlForDownloadQuery(_request: RequestV1, _options: RequestOptions): TaskGenerator<string> {
    return yield '';
  }

  /**
   * @param this
   * @param request
   * @param options
   */
  @task *fetchDataForRequest(request: RequestV2, options: RequestOptions = {}): TaskGenerator<AsyncQueryResponse> {
    const host = configHost(options);
    const timeDimensions = request.filters.filter(({ type }) => type === 'timeDimension');
    let url: string;
    if (timeDimensions.length === 0) {
      const time = moment().unix();
      url = `${host}/api/v1/query?time=${time}&query=`;
    } else if (timeDimensions.length === 1) {
      if (request.columns.filter(({ type }) => type === 'timeDimension').length !== 1) {
        throw new FactAdapterError('Request with time filter must also contain time column');
      }
      const startValue = String(timeDimensions[0].values[0]);
      const endValue = String(timeDimensions[0].values[1]);
      const grain = timeDimensions[0].parameters.grain as Grain;
      const { start, end } = Interval.parseInclusive(startValue, endValue, grain).asMomentsInclusive(grain);
      url = `${host}/api/v1/query_range?start=${start.unix()}&end=${end.unix()}&step=60s&query=`;
    } else {
      throw new FactAdapterError('Request does not support more than 1 time filter');
    }
    const dimensions = request.columns.filter(({ type }) => type === 'dimension');
    const filter = request.filters
      .filter(({ type, values }) => type === 'dimension' && values.length > 0)
      .map(({ field, values, operator }) => this.filterBuilders[operator](field, values));
    const makeQuery = (metric: string) => `sum by(${dimensions.map((d) => d.field).join(',')})(${metric}{${filter}})`;
    const queries = request.columns
      .filter(({ type }) => type === 'metric')
      .map((column) => {
        const query = makeQuery(column.field);
        return this.ajax.request(`${url}${query}`, {
          timeout: 1000,
        });
      });
    return yield Promise.all(queries);
  }
}
