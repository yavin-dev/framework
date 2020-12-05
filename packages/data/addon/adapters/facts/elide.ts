/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { queryManager } from 'ember-apollo-client';
import NaviFactAdapter, {
  RequestV1,
  RequestOptions,
  AsyncQueryResponse,
  Parameters,
  QueryStatus,
  RequestV2,
  FilterOperator,
  Filter
} from './interface';
import { assert } from '@ember/debug';
import Interval from '../../utils/classes/interval';
import { getDefaultDataSource } from '../../utils/adapter';
import { DocumentNode } from 'graphql';
import GQLQueries from 'navi-data/gql/fact-queries';
import { task, timeout } from 'ember-concurrency';
import { v1 } from 'ember-uuid';
import moment, { Moment } from 'moment';
import { Grain } from 'navi-data/utils/date';

const escape = (value: string) => value.replace(/'/g, "\\\\'");

/**
 * Formats elide request field
 */
export function getElideField(fieldName: string, _parameters: Parameters = {}) {
  //TODO add parameter support when added to Elide
  const parts = fieldName.split('.');
  return parts[parts.length - 1];
}

export default class ElideFactsAdapter extends EmberObject implements NaviFactAdapter {
  /**
   * @property {Object} apollo - apollo client query manager using the overridden elide service
   */
  @queryManager({ service: 'navi-elide-apollo' })
  apollo: TODO;

  /**
   * @property {Number} _pollingInterval - number of ms between fetch requests during async request polling
   */
  _pollingInterval = 3000;

  private readonly grainFormats: Partial<Record<Grain, string>> = {
    second: 'yyy-MM-DDTHH:mm:ss',
    minute: 'yyyy-MM-DDTHH:mm',
    hour: 'yyyy-MM-DDTHH',
    day: 'yyyy-MM-DD',
    week: 'yyyy-MM-DD',
    isoWeek: 'yyyy-MM-DD',
    month: 'yyyy-MM',
    quarter: 'yyyy-MM',
    year: 'yyyy'
  };

  private formatTimeValue(value: Moment | string, grain: Grain) {
    return moment(value).format(this.grainFormats[grain]);
  }

  private filterBuilders: Record<FilterOperator, (field: string, value: string[]) => string> = {
    eq: (f, v) => `${f}==('${v[0]}')`,
    neq: (f, v) => `${f}!=('${v[0]}')`,
    in: (f, v) => `${f}=in=(${v.map(e => `'${e}'`).join(',')})`,
    notin: (f, v) => `${f}=out=(${v.map(e => `'${e}'`).join(',')})`,
    contains: (f, v) => `${f}=in=(${v.map(e => `'*${e}*'`).join(',')})`,
    null: (f, _v) => `${f}=isnull=true`,
    notnull: (f, _v) => `${f}=isnull=false`,
    lte: (f, v) => `${f}=le=('${v}')`,
    gte: (f, v) => `${f}=ge=('${v}')`,
    lt: (f, v) => `${f}=lt=('${v}')`,
    gt: (f, v) => `${f}=gt=('${v}')`,
    bet: (f, v) => `${f}=ge=('${v[0]}');${f}=le=('${v[1]}')`,
    nbet: (f, v) => `${f}=lt=('${v[0]}'),${f}=gt=('${v[1]}')`
  };

  private buildFilterStr(filters: Filter[]): string {
    const filterStrings = filters.map(filter => {
      const { field, parameters, operator, values, type } = filter;

      //skip filters without values
      if (0 === values.length) {
        return null;
      }

      const fieldStr = getElideField(field, parameters);
      let filterVals = values.map(v => escape(`${v}`));

      if (type === 'timeDimension') {
        const grain = filter.parameters.grain as Grain;
        let timeValues: (Moment | string | number)[] = filterVals;
        if (['bet', 'nbet'].includes(operator)) {
          const { start, end } = Interval.parseFromStrings(
            String(filterVals[0]),
            String(filterVals[1])
          ).asMomentsForTimePeriod(grain);
          timeValues = [start, end];
        }
        filterVals = timeValues.map(v => this.formatTimeValue(`${v}`, grain));
      }
      const builderFn = this.filterBuilders[operator];
      assert(`Filter operator not supported: ${operator}`, builderFn);
      return builderFn(fieldStr, filterVals);
    });

    return filterStrings.filter(f => f).join(';');
  }

  /**
   * @param request
   * @returns graphql query string for a v2 request
   */
  private dataQueryFromRequest(request: RequestV2): string {
    const args = [];
    const { table, columns, sorts, limit, filters } = request;
    const columnsStr = columns.map(col => getElideField(col.field, col.parameters)).join(' ');

    const filterString = this.buildFilterStr(filters);
    filterString.length && args.push(`filter: "${filterString}"`);

    const sortStrings = sorts.map(sort => {
      const { field, parameters, direction } = sort;
      const column = getElideField(field, parameters);
      return `${direction === 'desc' ? '-' : ''}${column}`;
    });
    sortStrings.length && args.push(`sort: "${sortStrings.join(',')}"`);

    const limitStr = limit ? `first: "${limit}"` : null;
    limitStr && args.push(limitStr);

    const argsString = args.length ? `(${args.join(',')})` : '';

    return JSON.stringify({
      query: `{ ${table}${argsString} { edges { node { ${columnsStr} } } } }`
    });
  }

  /**
   * @param request
   * @param options
   * @returns Promise that resolves to the result of the AsyncQuery creation mutation
   */
  createAsyncQuery(request: RequestV2, options: RequestOptions = {}): Promise<AsyncQueryResponse> {
    const mutation: DocumentNode = GQLQueries['asyncFactsMutation'];
    const query = this.dataQueryFromRequest(request);
    const id: string = options.requestId || v1();
    const dataSourceName = request.dataSource || options.dataSourceName;

    // TODO: Add other options based on RequestOptions
    const queryOptions = { mutation, variables: { id, query }, context: { dataSourceName } };
    return this.apollo.mutate(queryOptions);
  }

  /**
   * @param id
   * @returns Promise with the updated asyncQuery's id and status
   */
  cancelAsyncQuery(id: string, dataSourceName?: string) {
    const mutation: DocumentNode = GQLQueries['asyncFactsCancel'];
    dataSourceName = dataSourceName || getDefaultDataSource().name;
    return this.apollo.mutate({ mutation, variables: { id }, context: { dataSourceName } });
  }

  /**
   * @param id
   * @returns Promise that resolves to the result of the AsyncQuery fetch query
   */
  fetchAsyncQuery(id: string, dataSourceName?: string) {
    const query: DocumentNode = GQLQueries['asyncFactsQuery'];
    dataSourceName = dataSourceName || getDefaultDataSource().name;
    return this.apollo.query({ query, variables: { ids: [id] }, context: { dataSourceName } });
  }

  /**
   * @param _request
   * @param _options
   */
  urlForFindQuery(_request: RequestV1, _options: RequestOptions): string {
    return 'TODO';
  }

  /**
   * @param _request
   * @param _options
   */
  async urlForDownloadQuery(_request: RequestV1, _options: RequestOptions): Promise<string> {
    return 'TODO';
  }
  /**
   * @param request
   * @param options
   */
  @task(function*(this: ElideFactsAdapter, request: RequestV2, options: RequestOptions) {
    let asyncQueryPayload = yield this.createAsyncQuery(request, options);
    const asyncQuery = asyncQueryPayload?.asyncQuery.edges[0]?.node;
    const { id } = asyncQuery;
    let status: QueryStatus = asyncQuery.status;

    while (status === QueryStatus.QUEUED || status === QueryStatus.PROCESSING) {
      yield timeout(this._pollingInterval);
      asyncQueryPayload = yield this.fetchAsyncQuery(id, request.dataSource);
      status = asyncQueryPayload?.asyncQuery.edges[0]?.node.status;
    }
    return asyncQueryPayload;
  })
  fetchDataForRequestTask!: TODO;

  /**
   * @param this
   * @param request
   * @param options
   */
  async fetchDataForRequest(
    this: ElideFactsAdapter,
    request: RequestV2,
    options: RequestOptions = {}
  ): Promise<AsyncQueryResponse> {
    const payload = await this.fetchDataForRequestTask.perform(request, options);
    const responseStr = payload?.asyncQuery.edges[0].node.result?.responseBody;
    const responseBody = JSON.parse(responseStr);
    if (responseBody.errors) {
      throw payload;
    } else {
      return payload;
    }
  }
}
