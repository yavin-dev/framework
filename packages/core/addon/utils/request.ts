/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { hasParameters, getAliasedMetrics, canonicalizeMetric } from 'navi-data/utils/metric';
import { nanoid } from 'nanoid';
import moment from 'moment';
import { getPeriodForGrain } from '@yavin/client/utils/date';
import type { Parameters, SortDirection, RequestV2, FilterOperator } from 'navi-data/adapters/facts/interface';
import type { GrainWithAll } from 'navi-data/serializers/metadata/bard';
import type NaviMetadataService from 'navi-data/services/navi-metadata';

type LogicalTable = {
  table: string;
  timeGrain: GrainWithAll;
};

type Interval = {
  start: string;
  end: string;
};

type Dimension = {
  dimension: string;
};

export type Metric = {
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

export type RequestV1<T> = {
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
  aliasMap: Record<string, string> = {},
  canonMap: Record<string, Metric> = {}
): TODO[] {
  if (!field) {
    return [];
  }
  return field.map((obj) => {
    const metricName: string =
      typeof obj.metric === 'object' ? canonicalizeMetric(obj.metric) || obj.metric.metric : obj.metric;

    obj.metric = aliasMap[metricName] || metricName;
    obj.metric = canonMap[obj.metric] || obj.metric;
    obj.metric = typeof obj.metric === 'string' ? obj.metric : Object.assign({}, obj.metric);

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
        [canonicalizeMetric(metric)]: metric,
      }),
    {
      //add dateTime to cannonicalName -> metric map
      dateTime: { metric: 'dateTime' },
    }
  );

  const normalized = Object.assign({}, request, {
    having: toggleAlias(request.having, aliasToCanon, canonToMetric),
    sort: toggleAlias(request.sort, aliasToCanon, canonToMetric),
  });

  if (!normalized.dataSource && namespace) {
    normalized.dataSource = namespace;
  }

  //remove AS from metric parameters
  normalized.metrics = request.metrics.map((metric) => {
    if (hasParameters(metric)) {
      delete metric.parameters?.as;
    }
    return metric;
  });

  return normalized;
}

/**
 * Checks if a given 'dimension' from a v1 fili request is a v2 'dimension' or 'timeDimension'
 * @param dimension - dimension to lookup
 * @param dataSource - datasource of dimension
 * @param naviMetadata - metadata service
 * @returns 'timeDimension' | 'dimension'
 */
export function getRealDimensionType(dimension: string, dataSource: string, naviMetadata: NaviMetadataService) {
  return naviMetadata.getById('timeDimension', dimension, dataSource) ? 'timeDimension' : 'dimension';
}

/**
 * Normalizes Request V1 payload into V2
 * @param request
 * @param namespace - request datasource
 * @returns request normalized into v2
 */
export function normalizeV1toV2(
  request: RequestV1<string>,
  dataSource: string,
  naviMetadata: NaviMetadataService
): RequestV2 {
  //normalize v1 request
  const normalized = Object.assign({}, normalizeV1(request, dataSource));

  const {
    logicalTable: { table, timeGrain },
  } = normalized;

  const grain = timeGrain === 'week' ? 'isoWeek' : timeGrain;

  const requestV2: RequestV2 = {
    requestVersion: '2.0',
    table: removeNamespace(table, dataSource),
    dataSource,
    columns: [],
    filters: [],
    sorts: [],
    limit: null,
  };

  //normalize dateTime column
  if (grain !== 'all') {
    requestV2.columns.push({
      cid: nanoid(10),
      type: 'timeDimension',
      field: `${table}.dateTime`,
      parameters: { grain },
    });
  }

  //normalize dimensions
  normalized.dimensions.forEach(({ dimension }) => {
    // skip if dimension is null or empty
    if (dimension) {
      const type = getRealDimensionType(dimension, dataSource, naviMetadata);
      let extraParams = {};
      if (type === 'timeDimension') {
        const grain = naviMetadata.getById(type, dimension, dataSource)?.getParameter('grain')?.defaultValue;
        extraParams = { grain: grain ?? 'day' };
      }

      requestV2.columns.push({
        cid: nanoid(10),
        type,
        field: removeNamespace(dimension, dataSource),
        parameters: {
          field: 'id',
          ...extraParams,
        },
      });
    }
  });

  //normalize metrics
  normalized.metrics.forEach(({ metric, parameters = {} }) => {
    if (metric) {
      requestV2.columns.push({
        cid: nanoid(10),
        type: 'metric',
        field: removeNamespace(metric, dataSource),
        parameters,
      });
    }
  });

  //normalize intervals
  normalized.intervals.forEach(({ start, end }) => {
    // if start and end are dates, end.subtract(1, getPeriodForGrain(grain))
    const startMoment = moment.utc(start);
    const endMoment = moment.utc(end);
    const filterGrain = grain === 'all' ? 'day' : grain;
    if (startMoment.isValid() && endMoment.isValid()) {
      endMoment.subtract(1, getPeriodForGrain(filterGrain));
    }

    start = startMoment.isValid() ? startMoment.toISOString() : start;
    end = endMoment.isValid() ? endMoment.toISOString() : end;

    requestV2.filters.push({
      type: 'timeDimension',
      field: `${table}.dateTime`,
      operator: 'bet',
      values: [start, end],
      parameters: {
        grain: filterGrain,
      },
    });
  });

  //normalize filters
  normalized.filters.forEach(({ dimension, field, operator, values }) => {
    const type = getRealDimensionType(dimension, dataSource, naviMetadata);
    let filterValues;
    if (type === 'timeDimension') {
      if (operator === 'lt') {
        operator = 'lte';
        let [end] = values;
        const endMoment = moment.utc(end);
        if (endMoment.isValid()) {
          end = endMoment.subtract(1, 'day').toISOString();
        }
        filterValues = [end];
      } else {
        filterValues = values;
      }
    } else {
      if (operator === 'null') {
        operator = 'isnull';
        filterValues = [true];
      } else if (operator === 'notnull') {
        operator = 'isnull';
        filterValues = [false];
      } else {
        filterValues = values;
      }
    }

    let extraParams = {};
    if (type === 'timeDimension') {
      const grain = naviMetadata.getById(type, dimension, dataSource)?.getParameter('grain')?.defaultValue;
      extraParams = { grain: grain ?? 'day' };
    }

    requestV2.filters.push({
      type,
      field: removeNamespace(dimension, dataSource),
      parameters: {
        field: field || 'id',
        ...extraParams,
      },
      operator: operator as FilterOperator,
      values: filterValues,
    });
  });

  //normalize having
  normalized.having.forEach(({ metric: { metric, parameters = {} }, operator, values }) => {
    requestV2.filters.push({
      type: 'metric',
      field: removeNamespace(metric, dataSource),
      parameters,
      operator: operator as FilterOperator,
      values,
    });
  });

  //normalize sorts
  normalized.sort.forEach(({ metric: { metric, parameters = {} }, direction }) => {
    const isDateTime = metric === 'dateTime' || metric.endsWith('.dateTime');
    requestV2.sorts.push({
      type: isDateTime ? 'timeDimension' : 'metric',
      field: isDateTime ? `${table}.dateTime` : removeNamespace(metric, dataSource),
      parameters: isDateTime ? { grain } : parameters,
      direction,
    });
  });

  return requestV2;
}
