/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { readOnly } from '@ember/object/computed';

import { get, set } from '@ember/object';
import { A as arr } from '@ember/array';
import DS from 'ember-data';
import VisualizationBase from './visualization';
import { canonicalizeMetric, canonicalizeColumnAttributes } from 'navi-data/utils/metric';
import { validator, buildValidations } from 'ember-cp-validations';
import { metricFormat } from 'navi-data/helpers/metric-format';
import { canonicalizeDimension, formatDimensionName } from 'navi-data/utils/dimension';
import keyBy from 'lodash/keyBy';

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    'metadata.columns': validator(
      function(columns, options) {
        let request = get(options, 'request');
        return request && hasAllColumns(request, arr(columns));
      },
      {
        dependentKeys: ['model._request.dimensions.[]', 'model._request.metrics.[]']
      }
    )
  },
  {
    //Global Validation Options
    request: readOnly('model._request')
  }
);

export default VisualizationBase.extend(Validations, {
  type: DS.attr('string', { defaultValue: 'table' }),
  version: DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({
    defaultValue: () => {
      return { columns: [] };
    }
  }),

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
      type: 'dateTime',
      attributes: { name: 'dateTime' },
      displayName: 'Date'
    };

    let newColumns = [
      dateColumn,
      ...buildDimensionColumns(dimensions, columnIndex),
      ...buildMetricColumns(metrics, columnIndex)
    ];

    set(this, 'metadata', {
      columns: columnTransform(newColumns, columns)
    });

    return this;
  }
});

/**
 * returns default dimension fields (show clause)
 * @param {Object} dimension - dimension from request
 * @returns {Object} - list of field names
 */
function getDefaultDimensionFields(dimension) {
  return get(dimension, 'dimension')
    .getFieldsForTag('show')
    .map(field => field.name);
}

/**
 * builds a single dimension column
 * @param {Object} dimension
 * @param {Object} columnIndex
 * @param {String} field
 * @returns {Object} - dimension column
 */
function buildDimensionColumn(dimension, columnIndex, field) {
  let dimensionName = get(dimension, 'dimension.name'),
    column = columnIndex[dimensionName],
    defaultName = formatDimensionName({ name: get(dimension, 'dimension.longName'), field });

  return {
    type: 'dimension',
    attributes: Object.assign({}, { name: get(dimension, 'dimension.name') }, field ? { field } : {}),
    displayName: column ? column.displayName : defaultName
  };
}

/**
 * builds dimension columns for new visualization builds
 * @param {Array} dimensions - dimensions from request
 * @param {Object} columnIndex - column lookup table indexed by dimension/metric name
 * @returns {Array} - list of dimensions columns
 */
function buildDimensionColumns(dimensions, columnIndex) {
  let dimensionColumns = dimensions.map(dimension => {
    let defaultFields = getDefaultDimensionFields(dimension);

    return defaultFields.length
      ? defaultFields.map(field => buildDimensionColumn(dimension, columnIndex, field))
      : buildDimensionColumn(dimension, columnIndex);
  });

  //flatten the array in case it's nested
  return [].concat(...dimensionColumns);
}

/**
 * builds metric columns for new visualization builds
 * @param {Array} metrics - metrics from request
 * @param {Object} columnIndex - column lookup table indexed by dimension/metric name
 * @returns {Array} - list of metric columns
 */
function buildMetricColumns(metrics, columnIndex) {
  return metrics.map(metric => {
    // Trend metrics should render using threshold coloring
    let category = get(metric, 'metric.category'),
      isTrend = ~category.toLowerCase().indexOf('trend'),
      type = isTrend ? 'threshold' : 'metric',
      metricObject = metric.toJSON(),
      column = columnIndex[canonicalizeMetric(metricObject)],
      longName = get(metric, 'metric.longName'),
      displayName = column ? column.displayName : metricFormat(metric, longName),
      format = column ? get(column, 'attributes.format') : '';

    return {
      type,
      displayName,
      attributes: Object.assign(
        {},
        {
          name: metricObject.metric,
          parameters: metricObject.parameters
        },
        { format }
      )
    };
  });
}

/**
 * transforms columns based on old column configuration (at this time it just sorts)
 * @param {Array} newColumns - new columns to be applied to visualization
 * @param {Array} oldColumns - columns form last time visualization was configured
 */
function columnTransform(newColumns, oldColumns) {
  if (oldColumns.length) {
    const isSameColumn = (a, b) => a.displayName === b.displayName;
    newColumns.sort((a, b) => {
      let foundA = oldColumns.findIndex(item => isSameColumn(item, a)),
        foundB = oldColumns.findIndex(item => isSameColumn(item, b));
      return foundA > -1 && foundB > -1 ? foundA - foundB : 0;
    });
  }

  return newColumns;
}

/**
 * Determines if the columns include all dimensions
 * and metrics from the request
 *
 * @function hasAllColumns
 * @param {Object} request - request object
 * @param {Object} columns - config column array
 * @returns {Boolean} whether or not
 */
function hasAllColumns(request, columns) {
  //retrieve everything but dateTime from metadata.columns
  let columnFields = arr(columns)
      .rejectBy('type', 'dateTime')
      .map(column => {
        let attributes = get(column, 'attributes');
        if (get(column, 'type') === 'dimension') {
          return canonicalizeDimension(attributes);
        } else {
          return canonicalizeColumnAttributes(attributes);
        }
      }),
    dimensions = [].concat(
      ...get(request, 'dimensions').map(dimension => {
        let name = get(dimension, 'dimension.name'),
          defaultFields = getDefaultDimensionFields(dimension);
        return !defaultFields.length ? name : defaultFields.map(field => canonicalizeDimension({ name, field }));
      })
    ),
    metrics = arr(get(request, 'metrics')).mapBy('canonicalName'),
    requestFields = [...dimensions, ...metrics];

  return requestFields.length === columnFields.length && requestFields.every(field => columnFields.includes(field));
}

export function indexColumnById(columns) {
  return keyBy(columns, ({ type, attributes }) => {
    if (type === 'threshold') {
      type = 'metric';
    }

    if (type === 'metric') {
      return canonicalizeColumnAttributes(attributes);
    } else if (type === 'dimension' && attributes.field) {
      return canonicalizeDimension(attributes);
    } else {
      return attributes.name;
    }
  });
}
