/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import JSONSerializer from '@ember-data/serializer/json';
import { isEmpty } from 'lodash-es';
import { inject as service } from '@ember/service';

export default class RequestSerializer extends JSONSerializer {
  /**
   * @property {Service} store
   */
  @service store;

  /**
   * Normalizes the JSON payload returned by the persistence layer
   * @override
   * @param {Model} typeClass
   * @param {Object} request
   * @return {Object} normalized request
   */
  normalize(typeClass, request) {
    if (request.requestVersion === 'v1') {
      //normalize v1 request
      this.store.serializerFor('bard-request/request').normalizeRequest(request);

      const {
        logicalTable: { table, timeGrain: grain }
      } = request;

      //normalize table
      request.table = this._removeNamespace(table);

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
          field: this._removeNamespace(dimension)
        });
      });
      delete request.dimensions;

      //normalize metrics
      request.metrics.forEach(({ metric, parameters }) => {
        request.columns.push({
          type: 'metric',
          field: this._removeNamespace(metric),
          ...(isEmpty(parameters) ? {} : { parameters })
        });
      });
      delete request.metrics;

      //normalize filters
      request.filters = request.filters.map(({ dimension, field, operator, values }) => ({
        type: 'dimension',
        field: this._removeNamespace(dimension),
        parameters: { projection: field || 'id' },
        operator,
        values
      }));

      //normalize having
      request.having.forEach(({ metric: { metric, parameters }, operator, values }) => {
        request.filters.push({
          type: 'metric',
          field: this._removeNamespace(metric),
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
          field: metric.endsWith('.dateTime') ? 'dateTime' : this._removeNamespace(metric),
          ...(isEmpty(parameters) ? {} : { parameters }),
          direction
        });
      });
      delete request.sort;

      request.requestVersion = '2.0';
    }

    //copy source property from request
    ['columns', 'filters', 'sorts'].forEach(attr =>
      request[attr].forEach(fragment => (fragment.source = request.dataSource))
    );

    return super.normalize(typeClass, request);
  }

  /**
   * Strips data source prefix from fragment id
   * @private
   * @param {String} id
   * @return {String} id minus prefix
   */
  _removeNamespace(id) {
    if (id.includes('.')) {
      return id
        .split('.')
        .slice(1)
        .join('.');
    }
    return id;
  }
}
