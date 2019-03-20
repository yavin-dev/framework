/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

/* global requirejs */

import { faker, Response } from 'ember-cli-mirage';
import moment from 'moment';
import { assign } from '@ember/polyfills';

const API_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS',
  DIMENSION_VALUE_MAP = {},
  MISSING_INTERVALS = [
    '2018-11-12 00:00:00.000/2018-11-14 00:00:00.000',
    '2018-11-15 00:00:00.000/2018-11-16 00:00:00.000'
  ];

/**
 * @method _getDates
 * @param {String} grain - time period
 * @param {String} start - beginning of time period - must be a duration
 * @param {String} end - end of time period - must be 'current' or fixed date
 * @returns {Array} list of moments in requested time range
 */
function _getDates(grain, start, end) {
  let endDate =
      end === 'current'
        ? // need to use isoweek, which is what real ws uses
          moment().startOf(grain === 'week' ? 'isoweek' : grain)
        : moment(end, API_DATE_FORMAT),
    startDate = start.startsWith('P')
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
 * @method _getDimensionValues
 * @param {String} name - dimension to get values for
 * @returns {Array} list of object with id + description
 */
function _getDimensionValues(name, filterValues) {
  // Return cached values, or fake new ones
  let values =
    DIMENSION_VALUE_MAP[name] ||
    (DIMENSION_VALUE_MAP[name] = _fakeDimensionValues(name, faker.random.number({ min: 3, max: 5 })));
  return filterValues
    ? values.reduce((arr, value) => {
        if (filterValues.includes(value.id)) {
          arr.push(value);
        }
        return arr;
      }, [])
    : values;
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
  metricBuilder = (metric, row) => {
    row[metric] = faker.finance.amount();
  }
) {
  _loadPredefinedDimensions();

  this.get('/data/*path', function(db, request) {
    let [table, grain, ...dimensions] = request.params.path.split('/');

    if (table === 'protected') {
      return new Response(403, {}, { error: 'user not allowed to query this table' });
    }

    // Get date range from query params + grain
    let dates = _getDates(grain, ...request.queryParams.dateTime.split('/'));
    let filters = {};
    if (request.queryParams.filters) {
      filters = request.queryParams.filters.split(']').reduce((filterObj, currFilter) => {
        if (currFilter.length > 0) {
          if (currFilter[0] === ',') currFilter = currFilter.substring(1);

          let dimension = currFilter.split('|')[0],
            values = currFilter.split('[')[1].split(',');

          filterObj[dimension] = values;
        }

        return filterObj;
      }, filters);
    }

    // Convert each date into a row of data
    let rows = dates.map(date => {
      return {
        dateTime: date.format(API_DATE_FORMAT)
      };
    });

    // Add id and desc for each dimension
    dimensions.forEach(dimension => {
      if (dimension.length > 0) {
        rows = rows.reduce((newRows, currentRow) => {
          let dimensionValues = _getDimensionValues(dimension, filters[dimension]);

          return newRows.concat(
            dimensionValues.map(value =>
              // TODO figure out why Object.assign refuses to work in Phantom even with Babel polyfill
              assign({}, currentRow, {
                [`${dimension}|id`]: value.id,
                [`${dimension}|desc`]: value.description
              })
            )
          );
        }, []);
      }
    });

    // Add each metric
    rows.forEach(row => {
      request.queryParams.metrics.split(',').forEach(metric => metricBuilder(metric, row));
    });

    let missingIntervals = request.queryParams.metrics.includes('uniqueIdentifier') ? MISSING_INTERVALS : undefined;

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
      let [, /* full match */ queryString] = request.queryParams.filters.match(/\[(.*)\]/),
        values = queryString.split(','),
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
