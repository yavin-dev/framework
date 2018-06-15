/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import DS from 'ember-data';
import VisualizationBase from './visualization';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { validator, buildValidations } from 'ember-cp-validations';
import { metricFormat } from 'navi-data/helpers/metric-format';
import keyBy from 'lodash/keyBy';

const {
  A:arr,
  computed,
  get,
  set
} = Ember;

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations({
  'metadata.columns': validator(function(columns, options) {
    let request = get(options, 'request');
    return request && hasAllColumns(request, arr(columns));
  }, {
    dependentKeys: [
      'model._request.dimensions.[]',
      'model._request.metrics.[]'
    ]
  }),
}, {
  //Global Validation Options
  request: computed.readOnly('model._request')
});

export default VisualizationBase.extend(Validations, {
  type:     DS.attr('string', { defaultValue: 'table'}),
  version:  DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({ defaultValue: () => {
    return { columns: [] };
  }}),

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request /*, response */) {
    let dimensions = get(request, 'dimensions') || [],
        metrics = get(request, 'metrics') || [],
        columns = get(this, 'metadata.columns'),
        // index column based on metricId or dimensionId
        columnIndex = indexColumnById(columns);

    let dateColumn = {
      field: {dateTime: 'dateTime'},
      type: 'dateTime',
      displayName: 'Date'
    };

    let dimensionColumns = dimensions.map(dimension => {
      let column = columnIndex[get(dimension, 'dimension.name')];

      return {
        field: {dimension: get(dimension, 'dimension.name')},
        type: 'dimension',
        displayName: column ? column.displayName : get(dimension, 'dimension.longName')
      };
    });

    let metricColumns = metrics.map(metric => {
      // Trend metrics should render using threshold coloring
      let category = get(metric, 'metric.category'),
          isTrend = ~(category.toLowerCase().indexOf('trend')),
          type = isTrend ? 'threshold' : 'metric',
          field = metric.toJSON(),
          column = columnIndex[field.metric],
          longName = get(metric, 'metric.longName'),
          displayName = column ? column.displayName : metricFormat(metric, longName),
          format = column ? column.format : '';

      return {
        type,
        displayName,
        field,
        format
      };
    });

    set(this, 'metadata', {
      columns: [
        dateColumn,
        ...dimensionColumns,
        ...metricColumns
      ]
    });

    return this;
  }
});

/**
 * Determines if the columns has all dimensions
 * and metrics from request
 *
 * @function hasSameValues
 * @param {Object} request - request object
 * @param {Object} columns - config column array
 * @returns {Boolean} whether or not
 */
function hasAllColumns(request, columns) {
  //retrieve everything but dateTime from metadata.columns
  let columnFields  = arr(arr(columns).rejectBy('type','dateTime')).map(column => get(column, 'field.dimension') || canonicalizeMetric(get(column, 'field'))),
      dimensions    = arr(get(request, 'dimensions')).mapBy('dimension.name'),
      metrics       = arr(get(request, 'metrics')).mapBy('canonicalName'),
      requestFields = [ ...dimensions, ...metrics ];

  return requestFields.length === columnFields.length &&
    requestFields.every(field => columnFields.includes(field));
}

export function indexColumnById(columns) {
  return keyBy(columns, ({ field, type }) => {
    if (type === 'threshold') {
      type = 'metric';
    }

    return field[type];
  });
}