/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { hasParameters, getAliasedMetrics, canonicalizeMetric } from 'navi-data/utils/metric';
import { Parameters, SortDirection, RequestV2 } from 'navi-data/adapters/fact-interface';

type LogicalTable = {
  table: string;
  timeGrain: string;
};

type Interval = {
  start: string;
  end: string;
};

type Dimension = {
  dimension: string;
};

type Metric = {
  metric: string;
  parameters?: Parameters;
};

type Filter = {
  dimension: string;
  operator: string;
  values: string[];
  field: string;
};

type Having<T> = {
  metric: T;
  operator: string;
  values: string[];
};

type Sort<T> = {
  metric: T;
  direction: SortDirection;
};

type RequestV1<T> = {
  requestVersion: 'v1';
  dataSource?: string;
  logicalTable: LogicalTable;
  intervals: Interval[];
  dimensions: Dimension[];
  metrics: Metric[];
  filters: Filter[];
  having: Having<T>[];
  sort: Sort<T>[];
};

/**
 * Input a list of objects, replace with alias or canonicalized metric,
 * if provided will replace serialized metric.
 *
 * This works on both ends of serialization and deserialization
 *
 * TODO: possibly break into pure add/remove alias functions with specific return types
 *
 * @param field - property off the request object to transform
 * @param aliasMap  - Either a map of of aliases to canon name (for deserialization) or canon name to alias (for serialization)
 * @param canonMap  - Map of canon name to metric object {metric, parameters}
 * @param namespace - request datasource
 * @returns copy of the field object transformed with aliases, or alias to metric object
 */
export function toggleAlias(
  field: Array<{ metric: Metric | string }>,
  aliasMap: Dict<string> = {},
  canonMap: Dict<Metric> = {},
  namespace?: string
): TODO[] {
  if (!field) {
    return [];
  }
  return field.map(obj => {
    const metricName: string =
      canonicalizeMetric(obj.metric) ||
      (typeof obj.metric === 'string' && obj.metric) ||
      (typeof obj.metric === 'object' && obj.metric.metric);

    obj.metric = aliasMap[metricName] || metricName;
    obj.metric = canonMap[obj.metric] || obj.metric;
    obj.metric = typeof obj.metric === 'string' ? obj.metric : Object.assign({}, obj.metric);

    if (namespace && obj.metric.metric) {
      obj.metric.metric = `${namespace}.${obj.metric.metric}`;
    }
    return obj;
  });
}

/**
 * Strips data source prefix from fragment id
 * @param id
 * @param namespace
 * @returns id minus prefix
 */
function removeNamespace(id: string, namespace?: string): string {
  return namespace && id.startsWith(`${namespace}.`) ? id.slice(namespace.length + 1) : id;
}

/**
 * Normalizes Request V1 payload
 * @param request
 * @param namespace - request datasource
 * @returns normalized request
 */
export function normalizeV1(request: RequestV1<string>, namespace?: string): RequestV1<Metric> {
  // get alias -> canonName map
  const aliasToCanon = getAliasedMetrics(request.metrics);

  // build canonName -> metric map
  const canonToMetric = request.metrics.reduce(
    (obj, metric) =>
      Object.assign({}, obj, {
        [canonicalizeMetric(metric)]: metric
      }),
    {
      //add dateTime to cannonicalName -> metric map
      dateTime: { metric: 'dateTime' }
    }
  );

  const normalized = Object.assign({}, request, {
    having: toggleAlias(request.having, aliasToCanon, canonToMetric, namespace),
    sort: toggleAlias(request.sort, aliasToCanon, canonToMetric, namespace)
  });

  if (!normalized.dataSource && namespace) {
    normalized.dataSource = namespace;
  }

  //remove AS from metric parameters
  normalized.metrics = request.metrics.map(metric => {
    if (hasParameters(metric)) {
      delete metric.parameters?.as;
    }
    if (namespace) {
      metric.metric = `${namespace}.${metric.metric}`;
    }
    return metric;
  });

  if (namespace) {
    normalized.logicalTable.table = `${namespace}.${normalized.logicalTable.table}`;

    normalized.dimensions = normalized.dimensions.map(dimension => {
      dimension.dimension = `${namespace}.${dimension.dimension}`;
      return dimension;
    });

    normalized.filters = normalized.filters.map(filter => {
      filter.dimension = `${namespace}.${filter.dimension}`;
      return filter;
    });
  }

  return normalized;
}

/**
 * Normalizes Request V1 payload into V2
 * @param request
 * @param namespace - request datasource
 * @returns request normalized into v2
 */
export function normalizeV1toV2(request: RequestV1<string>, namespace?: string): RequestV2 {
  //normalize v1 request
  const normalized = Object.assign({}, normalizeV1(request, namespace));

  const {
    logicalTable: { table, timeGrain: grain },
    dataSource
  } = normalized;

  const requestV2: RequestV2 = {
    requestVersion: '2.0',
    table: removeNamespace(table, namespace),
    dataSource,
    columns: [],
    filters: [],
    sorts: [],
    limit: null
  };

  //normalize dateTime column
  requestV2.columns.push({
    field: 'dateTime',
    parameters: { grain },
    type: 'timeDimension'
  });

  //normalize dimensions
  normalized.dimensions.forEach(({ dimension }) =>
    requestV2.columns.push({
      type: 'dimension',
      field: removeNamespace(dimension, namespace),
      parameters: {}
    })
  );

  //normalize metrics
  normalized.metrics.forEach(({ metric, parameters = {} }) => {
    requestV2.columns.push({
      type: 'metric',
      field: removeNamespace(metric, namespace),
      parameters
    });
  });

  //normalize intervals
  normalized.intervals.forEach(({ start, end }) =>
    requestV2.filters.push({
      type: 'timeDimension',
      field: 'dateTime',
      operator: 'bet',
      values: [start, end],
      parameters: {
        grain
      }
    })
  );

  //normalize filters
  normalized.filters.forEach(({ dimension, field, operator, values }) =>
    requestV2.filters.push({
      type: 'dimension',
      field: removeNamespace(dimension, namespace),
      parameters: { projection: field },
      operator,
      values
    })
  );

  //normalize having
  normalized.having.forEach(({ metric: { metric, parameters = {} }, operator, values }) => {
    requestV2.filters.push({
      type: 'metric',
      field: removeNamespace(metric, namespace),
      parameters,
      operator,
      values
    });
  });

  //normalize sorts
  normalized.sort.forEach(({ metric: { metric, parameters = {} }, direction }) => {
    const isDateTime = metric === 'dateTime' || metric.endsWith('.dateTime');
    requestV2.sorts.push({
      type: isDateTime ? 'timeDimension' : 'metric',
      field: isDateTime ? 'dateTime' : removeNamespace(metric, namespace),
      parameters: isDateTime ? { grain } : parameters,
      direction
    });
  });

  return requestV2;
}
