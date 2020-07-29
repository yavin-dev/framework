/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { readOnly } from '@ember/object/computed';
import { get, set } from '@ember/object';
import { A as arr } from '@ember/array';
import DS from 'ember-data';
import VisualizationBase from './visualization';
import { canonicalizeColumnAttributes } from 'navi-data/utils/metric';
import { validator, buildValidations } from 'ember-cp-validations';
import { canonicalizeDimension, formatDimensionName } from 'navi-data/utils/dimension';
import { keyBy } from 'lodash-es';
import { getOwner } from '@ember/application';

/**
 * returns default dimension fields (show clause)
 * @param {Object} dimension - dimension from request
 * @returns {Object} - list of field names
 */
function getDefaultDimensionFields(dimension) {
  // TODO: Come back and clean this up for dateTime
  const fields = dimension.data.getFieldsForTag?.('show') || [];
  return fields.map(field => field.name);
}

/**
 * builds a single dimension column
 * @param {Object} dimension
 * @param {Object} columnIndex
 * @param {String} field
 * @returns {Object} - dimension column
 */
function buildDimensionColumn(dimension, columnIndex, field) {
  let dimensionId = dimension.field,
    column = columnIndex[dimensionId],
    defaultName = formatDimensionName({ name: dimension.columnMetadata.name, field });

  return {
    type: 'dimension',
    attributes: Object.assign({}, { name: dimensionId }, field ? { field } : {}),
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
function buildMetricColumns(metrics, columnIndex, naviFormatter) {
  return metrics.map(metric => {
    const column = columnIndex[metric.columnMetadata.id];
    const displayName = column
      ? column.displayName
      : naviFormatter.formatMetric(metric.columnMetadata, metric.parameters, metric.alias);
    const format = column ? get(column, 'attributes.format') : '';

    return {
      type: 'metric',
      displayName,
      attributes: Object.assign(
        {},
        {
          name: metric.field,
          parameters: metric.parameters,
          canAggregateSubtotal: true
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
 * and metrics from the request and if it should/does have
 * a dateTime column based on the timeGrain
 * (all timegrain shouldn't have dateTime column)
 *
 * @function hasAllColumns
 * @param {Object} request - request object
 * @param {Object} columns - config column array
 * @returns {Boolean} whether or not
 */
function hasAllColumns(request, columns) {
  const columnFields = arr(columns)
    .rejectBy('type', 'dateTime')
    .map(column => {
      const { attributes, type } = column;
      if (type === 'dimension' || type === 'time-dimension') {
        const attrs = Object.assign({}, attributes, { id: attributes.name });
        delete attrs.name;
        return canonicalizeDimension(attrs);
      } else {
        return canonicalizeColumnAttributes(attributes);
      }
    });

  const requestFields = request.columns.filter(c => c.field !== 'dateTime').map(c => c.canonicalName);
  const shouldHaveDateTimeCol = request.timeGrain !== 'all' || request.timeGrainColumn;
  const doesHaveDateTimeCol = columns.some(c => c.type === 'dateTime');

  return (
    requestFields.length === columnFields.length &&
    requestFields.every(field => columnFields.includes(field)) &&
    shouldHaveDateTimeCol === doesHaveDateTimeCol
  );
}

export function indexColumnById(columns) {
  return keyBy(columns, ({ type, attributes }) => {
    if (type === 'metric') {
      return canonicalizeColumnAttributes(attributes);
    } else if (type === 'dimension' && attributes.field) {
      const attrs = Object.assign({}, attributes, { id: attributes.name });
      delete attrs.name;
      return canonicalizeDimension(attrs);
    } else {
      return attributes.name;
    }
  });
}

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    'metadata.columns': validator('inline', {
      validate(columns, options) {
        const { request } = options;
        return request && hasAllColumns(request, columns);
      },
      dependentKeys: [
        'model._request.columns.[]',
        'model._request.columns.@each.parameters',
        'model._request.timeGrain'
      ]
    })
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
    const dimensions = request.dimensionColumns.filter(c => c.field !== 'dateTime');
    const metrics = request.metricColumns;
    const { columns } = this.metadata;
    // index column based on metricId or dimensionId
    const columnIndex = indexColumnById(columns);
    const hasTimeGrainColumn = !!request.timeGrainColumn;

    const naviFormatter = getOwner(this).lookup('service:navi-formatter');

    //Only add dateColumn if timegrain is not 'all'
    let dateColumn = hasTimeGrainColumn
      ? [
          {
            type: 'dateTime',
            attributes: { name: 'dateTime' },
            displayName: 'Date'
          }
        ]
      : [];

    const newColumns = [
      ...dateColumn,
      ...buildDimensionColumns(dimensions, columnIndex),
      ...buildMetricColumns(metrics, columnIndex, naviFormatter)
    ];

    set(this, 'metadata', {
      columns: columnTransform(newColumns, columns)
    });

    return this;
  }
});
