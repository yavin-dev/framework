/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { isEmpty } from 'lodash-es';
import { hasParameters, getAliasedMetrics, canonicalizeMetric } from 'navi-data/utils/metric';

/**
 * Input a list of objects, replace with alias or canonicalized metric,
 * if provided will replace serialized metric.
 *
 * This works on both ends of serialization and deserialization
 *
 * @param {Array} field - property off the request object to transform
 * @param {Object} aliasMap  - Either a map of of aliases to canon name (for deserialization) or canon name to alias (for serialization)
 * @param {Object} canonMap  - Map of canon name to metric object {metric, parameters}
 * @param {String} namespace - request datasource
 * @return {Array} - copy of the field object transformed with aliases, or alias to metric object
 */
export function toggleAlias(field, aliasMap = {}, canonMap = {}, namespace = null) {
  if (!field) {
    return;
  }
  return field.map(obj => {
    let metricName =
      canonicalizeMetric(obj.metric) || (typeof obj.metric === 'string' && obj.metric) || obj.metric.metric;

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
 * @param {String} id
 * @param {String} namespace
 * @return {String} id minus prefix
 */
function removeNamespace(id, namespace) {
  return id.startsWith(`${namespace}.`) ? id.slice(namespace.length + 1) : id;
}

/**
 * Normalizes Request V1 payload
 * @param {Object} request
 * @param {String} namespace - request datasource
 */
export function normalizeV1(request, namespace = null) {
  // get alias -> canonName map
  const aliasToCanon = getAliasedMetrics(request.metrics);

  // build canonName -> metric map
  const canonToMetric = request.metrics.reduce(
    (obj, metric) =>
      Object.assign({}, obj, {
        [canonicalizeMetric(metric)]: metric
      }),
    {}
  );

  //add dateTime to cannonicalName -> metric map
  canonToMetric['dateTime'] = { metric: 'dateTime' };

  request.having = toggleAlias(request.having, aliasToCanon, canonToMetric, namespace);
  request.sort = toggleAlias(request.sort, aliasToCanon, canonToMetric, namespace);

  if (!request.dataSource && namespace) {
    request.dataSource = namespace;
  }

  //remove AS from metric parameters
  request.metrics = request.metrics.map(metric => {
    if (hasParameters(metric)) {
      delete metric.parameters.as;
    }
    if (namespace) {
      metric.metric = `${namespace}.${metric.metric}`;
    }
    return metric;
  });

  if (namespace) {
    request.logicalTable.table = `${namespace}.${request.logicalTable.table}`;

    request.dimensions = request.dimensions.map(dimension => {
      dimension.dimension = `${namespace}.${dimension.dimension}`;
      return dimension;
    });

    request.filters = request.filters.map(filter => {
      filter.dimension = `${namespace}.${filter.dimension}`;
      return filter;
    });
  }
}

/**
 * Normalizes Request V1 payload into V2
 * @param {Object} request
 * @param {String} namespace - request datasource
 */
export function normalizeV1toV2(request, namespace = null) {
  //normalize v1 request
  normalizeV1(request, namespace);

  const {
    logicalTable: { table, timeGrain: grain }
  } = request;

  //normalize table
  request.table = removeNamespace(table, namespace);

  request.columns = [];

  //normalize dateTime column
  request.columns.push({
    field: 'dateTime',
    parameters: { grain },
    type: 'time-dimension'
  });
  delete request.logicalTable;

  //normalize dimensions
  request.dimensions.forEach(({ dimension }) => {
    request.columns.push({
      type: 'dimension',
      field: removeNamespace(dimension, namespace)
    });
  });
  delete request.dimensions;

  //normalize metrics
  request.metrics.forEach(({ metric, parameters }) => {
    request.columns.push({
      type: 'metric',
      field: removeNamespace(metric, namespace),
      ...(isEmpty(parameters) ? {} : { parameters })
    });
  });
  delete request.metrics;

  //normalize filters
  request.filters = request.filters.map(({ dimension, field, operator, values }) => ({
    type: 'dimension',
    field: removeNamespace(dimension, namespace),
    parameters: { projection: field || 'id' },
    operator,
    values
  }));

  //normalize having
  request.having.forEach(({ metric: { metric, parameters }, operator, values }) => {
    request.filters.push({
      type: 'metric',
      field: removeNamespace(metric, namespace),
      ...(isEmpty(parameters) ? {} : { parameters }),
      operator,
      values
    });
  });
  delete request.having;

  //normalize intervals
  request.filters = [
    ...request.intervals.map(interval => ({
      type: 'time-dimension',
      field: 'dateTime',
      operator: 'bet',
      values: [interval.start, interval.end]
    })),
    ...request.filters
  ];
  delete request.intervals;

  //normalize sorts
  request.sorts = [];
  request.sort.forEach(({ metric: { metric, parameters }, direction }) => {
    request.sorts.push({
      type: metric.endsWith('.dateTime') ? 'time-dimension' : 'metric',
      field: metric.endsWith('.dateTime') ? 'dateTime' : removeNamespace(metric, namespace),
      ...(isEmpty(parameters) ? {} : { parameters }),
      direction
    });
  });
  delete request.sort;

  request.requestVersion = '2.0';
}
