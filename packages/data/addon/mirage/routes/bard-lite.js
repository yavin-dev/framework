/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

/* global requirejs */

import faker from 'faker';
import { Response } from 'ember-cli-mirage';
import moment from 'moment';
import { groupBy, difference } from 'lodash-es';
import { parseFilters, parseHavings, parseMetrics } from './bard-lite-parsers';

const API_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS',
  DIMENSION_VALUE_MAP = {},
  MISSING_INTERVALS = [
    '2018-11-12 00:00:00.000/2018-11-14 00:00:00.000',
    '2018-11-15 00:00:00.000/2018-11-16 00:00:00.000'
  ],
  HAVING_OPS = {
    gt: (values, metricValue) => parseFloat(metricValue) > parseFloat(values[0]),
    gte: (values, metricValue) => parseFloat(metricValue) >= parseFloat(values[0]),
    lt: (values, metricValue) => parseFloat(metricValue) < parseFloat(values[0]),
    lte: (values, metricValue) => parseFloat(metricValue) <= parseFloat(values[0]),
    eq: (values, metricValue) => parseFloat(metricValue) === parseFloat(values[0]),
    neq: (values, metricValue) => parseFloat(metricValue) !== parseFloat(values[0]),
    bet: (values, metricValue) =>
      parseFloat(values[0]) < parseFloat(metricValue) && parseFloat(metricValue) < parseFloat(values[1]),
    nbet: (values, metricValue) =>
      !(parseFloat(values[0]) < parseFloat(metricValue) && parseFloat(metricValue) < parseFloat(values[1]))
  },
  DIMENSION_OPS = {
    in: (filterValues, value, field) => filterValues.includes(value[field]),
    notin: (filterValues, value, field) => !DIMENSION_OPS.in(filterValues, value, field),
    contains: (filterValues, value, field) => filterValues.some(v => value[field].includes(v))
  };

/**
 * @method _getDates
 * @param {String} grain - time period
 * @param {String} start - beginning of time period - must be a duration
 * @param {String} end - end of time period - must be 'current' or fixed date
 * @returns {Array} list of moments in requested time range
 */
function _getDates(grain, start, end) {
  const isoGrain = grain === 'week' ? 'isoweek' : grain; // need to use isoweek, which is what real ws uses
  let endDate;
  if (end === 'current') {
    endDate = moment().startOf(isoGrain);
  } else if (end === 'next') {
    endDate = moment()
      .startOf(isoGrain)
      .add(1, isoGrain);
  } else {
    endDate = moment(end, API_DATE_FORMAT);
  }
  let startDate = start.startsWith('P')
      ? endDate.clone().subtract(moment.duration(start))
      : moment(start, API_DATE_FORMAT),
    currentDate = startDate,
    dates = [];

  // handle "all" time grain
  if (grain === 'all') {
    return [moment(startDate, API_DATE_FORMAT)];
  }

  while (currentDate.isBefore(endDate)) {
    dates.push(currentDate.clone());
    currentDate.add(1, grain);
  }
  return dates;
}

/**
 * @method _filterDimensions
 * @param {Array} dimensions - The dimensions to filter
 * @param {Object} filter - the filter to be applied to array of dimensions
 * @returns {Array} - filtered array
 */
function _filterDimensions(dimensions, filter) {
  if (!filter) {
    return dimensions;
  }
  return dimensions.reduce((arr, value) => {
    if (DIMENSION_OPS[filter.operator](filter.values, value, filter.field)) {
      arr.push(value);
    }
    return arr;
  }, []);
}

/**
 * @method _fakeDimensionValues
 * @param {String} name - dimension to fake values for
 * @param {Number} count - number of values dimension should have
 * @returns {Array} list of object with id + description
 */
function _fakeDimensionValues(name, count) {
  let fakeValues = [];

  for (let i = 0; i < count; i++) {
    let key = null;
    // used to generate alternative primary keys for dimensions that don't use `id` as their primaryKey (in this case uses `key` instead)
    if (name === 'multiSystemId') {
      key = `k${i + 1}`;
    }
    fakeValues.push(
      Object.assign(
        {
          id: `${i + 1}`,
          description: faker.commerce.productName()
        },
        key ? { key } : null
      )
    );
  }

  return fakeValues;
}

/**
 * @method _getDimensionValues
 * @param {String} name - dimension to get values for
 * @returns {Array} list of object with id + description
 */
function _getDimensionValues(name, filter) {
  // Return cached values, or fake new ones
  let values =
    DIMENSION_VALUE_MAP[name] ||
    (DIMENSION_VALUE_MAP[name] = _fakeDimensionValues(name, faker.random.number({ min: 3, max: 5 })));
  return _filterDimensions(values, filter);
}

/**
 * Load fixed dimension values placed under mirage/bard-lite/dimensions
 *
 * @function _loadPredefinedDimensions
 * @private
 * @returns {Void}
 */
function _loadPredefinedDimensions() {
  let dimensionFixturesRegExp = new RegExp(`mirage/bard-lite/dimensions/(.*)`),
    fixtureEntries = Object.keys(requirejs.entries).filter(
      key => !key.endsWith('.jshint') && !key.endsWith('.lint-test') && dimensionFixturesRegExp.test(key)
    );

  fixtureEntries.forEach(requirejsKey => {
    let dimensionKey = dimensionFixturesRegExp.exec(requirejsKey)[1];
    DIMENSION_VALUE_MAP[dimensionKey] = requirejs(requirejsKey).default;
  });
}

export default function(
  metricBuilder = () => {
    return faker.finance.amount();
  }
) {
  _loadPredefinedDimensions();

  this.get('/data/*path', function(db, request) {
    faker.seed(request.url.length);
    let [table, grain, ...dimensions] = request.params.path.split('/');
    const hasRollUpDim = dimensions.includes('__rollupMask');
    dimensions = dimensions
      .filter(d => d.length > 0)
      .filter(dim => dim !== '__rollupMask')
      .sort();

    if (table === 'protected') {
      return new Response(403, {}, { error: 'user not allowed to query this table' });
    }

    // Get date range from query params + grain
    let dates = _getDates(grain, ...request.queryParams.dateTime.split('/'));
    let filters = [];
    if (request.queryParams.filters) {
      filters = parseFilters(request.queryParams.filters);
    }

    // Convert each date into a row of data
    let rows = dates.map(date => {
      return {
        dateTime: date.format(API_DATE_FORMAT)
      };
    });

    // Add id and desc for each dimension
    dimensions.forEach(dimension => {
      rows = rows.reduce((newRows, currentRow) => {
        const dimensionFilter = filters.find(f => f.dimension === dimension);
        let dimensionValues = _getDimensionValues(dimension, dimensionFilter);

        return newRows.concat(
          dimensionValues.map(value => {
            let newRow = Object.assign({}, currentRow);
            Object.keys(value).forEach(key => {
              if (key === 'description') {
                newRow[`${dimension}|desc`] = value[key];
              } else {
                newRow[`${dimension}|${key}`] = value[key];
              }
            });
            return newRow;
          })
        );
      }, []);
    });

    let havings = {};
    if (request.queryParams.having) {
      havings = parseHavings(request.queryParams.having);
    }

    // Add each metric
    rows = rows
      .map(row => {
        const dimensionKey = dimensions.map(d => `${d}=${row[`${d}|id`]}`).join('_');
        const metrics = parseMetrics(request.queryParams.metrics).reduce((metricsObj, metric) => {
          const having = havings[metric];
          const metricValue = metricBuilder(metric, row, dimensionKey);
          if (!having || HAVING_OPS[having.operator](having.values, metricValue)) {
            metricsObj[metric] = metricValue;
          }
          return metricsObj;
        }, {});

        Object.keys(metrics).forEach(metric => (row[metric] = metrics[metric]));
        return row;
      })
      .filter(r => r !== undefined);

    let missingIntervals = request.queryParams.metrics.includes('uniqueIdentifier') ? MISSING_INTERVALS : undefined;

    //lets do subtotal total stuff
    const processedDims = [];
    if (request.queryParams.rollupTo || request.queryParams.rollupGrandTotal) {
      let rollupDimensions = [];
      if (request.queryParams.rollupTo) {
        rollupDimensions = request.queryParams.rollupTo.split(',');
      }
      let groupedRows = [[...rows]];
      const metrics = parseMetrics(request.queryParams.metrics);
      const getMask = rolledupDims => {
        const rollupDimensionMask = ['dateTime', ...dimensions];
        const flagMap = rollupDimensionMask.map(rolledDim => (rolledupDims.includes(rolledDim) ? 1 : 0));
        return parseInt(flagMap.join(''), 2);
      };
      const fullMask = getMask(['dateTime', ...dimensions]);
      let grandTotalRow;

      if (request.queryParams.rollupGrandTotal) {
        grandTotalRow = rows.reduce((acc, row) => {
          if (acc === null) {
            acc = {};
            Object.keys(row).forEach(key => (acc[key] = null));
            if (hasRollUpDim) {
              acc.__rollupMask = 0;
            }
          }

          metrics.forEach(metric => {
            acc[metric] = acc[metric] + Number(row[metric]);
          });

          if (hasRollUpDim) {
            row.__rollupMask = fullMask;
          }
          return acc;
        }, null);
      } else {
        rows = rows.map(row => {
          if (hasRollUpDim) {
            row.__rollupMask = fullMask;
          }
        });
      }

      rollupDimensions.forEach(dim => {
        groupedRows = groupedRows.map(row => {
          let groupedRow = Object.values(groupBy(row, dim === 'dateTime' ? dim : `${dim}|id`));
          groupedRow = groupedRow.reduce((aggAcc, aggRow) => {
            const subtotalRow = aggRow.reduce((acc, row) => {
              if (row.__rollupMask !== fullMask) {
                //subtotal row, skip
                return acc;
              }
              const presentDims = [...processedDims, dim];
              presentDims.forEach(dim => {
                if (dim === 'dateTime') {
                  acc.dateTime = row.dateTime;
                } else {
                  acc[`${dim}|id`] = row[`${dim}|id`];
                  acc[`${dim}|desc`] = row[`${dim}|desc`];
                }
              });

              if (hasRollUpDim) {
                acc.__rollupMask = getMask([...processedDims, dim]);
              }

              metrics.forEach(metric => {
                if (!acc[metric]) {
                  acc[metric] = 0;
                }
                acc[metric] = acc[metric] + Number(row[metric]);
              });

              const nullDims = difference(['dateTime', ...dimensions], [...processedDims, dim]);
              nullDims.forEach(nullDim => {
                if (nullDim === 'dateTime') {
                  acc.dateTime = null;
                  return;
                }
                acc[`${nullDim}|id`] = null;
                acc[`${nullDim}|desc`] = null;
              });
              return acc;
            }, {});

            if (Object.keys(subtotalRow).length > 0) {
              aggAcc.push([...aggRow, subtotalRow]);
            } else {
              aggAcc.push(aggRow);
            }
            return aggAcc;
          }, []);
          return groupedRow;
        });
        if (groupedRows.length == 1) {
          groupedRows = groupedRows[0];
        }
        processedDims.push(dim);
      });
      const flatRows = groupedRows.flat(rollupDimensions.length);
      rows = grandTotalRow ? [...flatRows, grandTotalRow] : flatRows;
    }

    return {
      rows,
      meta: {
        pagination: {
          currentPage: 1,
          rowsPerPage: 10000,
          numberOfResults: rows.length
        },
        missingIntervals
      }
    };
  });

  this.get('/dimensions/:dimension/values', function(db, request) {
    let dimension = request.params.dimension,
      rows = _getDimensionValues(dimension);

    // Handle value filters
    if ('filters' in request.queryParams) {
      const { values } = parseFilters(request.queryParams.filters)[0],
        fieldMatch = request.queryParams.filters.match(/\|(id|key)/);

      rows =
        fieldMatch && fieldMatch.length > 0
          ? rows.filter(row => values.includes(row[fieldMatch[1]]))
          : rows.filter(row => values.some(value => row.description.toLowerCase().includes(value.toLowerCase())));
    }

    return { rows };
  });

  this.get('/dimensions/:dimension/search', function(db, request) {
    let dimension = request.params.dimension,
      rows = _getDimensionValues(dimension),
      { query } = request.queryParams;

    if (query) {
      let values = query
        .toLowerCase()
        .split(/\s+/)
        .map(v => v.trim())
        .filter(_ => _);

      rows = rows.filter(row => {
        let rowValue = `${row.id} ${row.description}`.toLowerCase();
        return values.every(value => rowValue.includes(value));
      });
    }

    return { rows };
  });
}
