/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Server } from 'miragejs';
//@ts-ignore
import faker from 'faker';
//@ts-ignore
import { Response } from 'ember-cli-mirage';
import moment from 'moment';
import {
  FiliDimension,
  FiliFilter,
  Havings,
  parseDimension,
  parseFilters,
  parseHavings,
  parseMetrics
} from './bard-lite-parsers';
import { getPeriodForGrain, Grain } from 'navi-data/utils/date';

const API_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS',
  DIMENSION_VALUE_MAP: Record<string, DimensionRow[]> = {},
  MISSING_INTERVALS = [
    '2018-11-12 00:00:00.000/2018-11-14 00:00:00.000',
    '2018-11-15 00:00:00.000/2018-11-16 00:00:00.000'
  ],
  HAVING_OPS = {
    gt: (values: string[], metricValue: number) => parseFloat(`${metricValue}`) > parseFloat(values[0]),
    gte: (values: string[], metricValue: number) => parseFloat(`${metricValue}`) >= parseFloat(values[0]),
    lt: (values: string[], metricValue: number) => parseFloat(`${metricValue}`) < parseFloat(values[0]),
    lte: (values: string[], metricValue: number) => parseFloat(`${metricValue}`) <= parseFloat(values[0]),
    eq: (values: string[], metricValue: number) => parseFloat(`${metricValue}`) === parseFloat(values[0]),
    neq: (values: string[], metricValue: number) => parseFloat(`${metricValue}`) !== parseFloat(values[0]),
    bet: (values: string[], metricValue: number) =>
      parseFloat(values[0]) < parseFloat(`${metricValue}`) && parseFloat(`${metricValue}`) < parseFloat(values[1]),
    nbet: (values: string[], metricValue: number) => !HAVING_OPS.bet(values, metricValue)
  },
  DIMENSION_OPS = {
    in: (filterValues: string[], value: DimensionRow, field: string) => {
      const dimFieldValue = value[field];
      if (filterValues.length === 1 && filterValues[0] === '""' && dimFieldValue === null) {
        return true;
      }
      return dimFieldValue && filterValues.includes(dimFieldValue);
    },
    notin: (filterValues: string[], value: DimensionRow, field: string) =>
      !DIMENSION_OPS.in(filterValues, value, field),
    contains: (filterValues: string[], value: DimensionRow, field: string) =>
      filterValues.some(v => value[field]?.includes(v))
  };

type ResponseRow = Record<string, unknown>;

const global = window as Window &
  // eslint-disable-next-line no-undef
  typeof globalThis & { requirejs: { entries: Record<string, unknown> } } & {
    requirejs: (k: string) => { default: any };
  } & { require: NodeRequire };

/**
 * @param grain - time period
 * @param start - beginning of time period - must be a duration
 * @param end - end of time period - must be 'current' or fixed date
 * @returns list of moments in requested time range
 */
function _getDates(grain: Grain, start: string, end: string) {
  const isoGrain = grain === 'week' ? 'isoWeek' : grain; // need to use isoweek, which is what real ws uses
  let endDate;
  const nonAllGrain = isoGrain === 'all' ? 'day' : isoGrain;
  if (end === 'current') {
    endDate = moment().startOf(nonAllGrain);
  } else if (end === 'next') {
    endDate = moment()
      .startOf(nonAllGrain)
      .add(1, getPeriodForGrain(nonAllGrain));
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
    currentDate.add(1, getPeriodForGrain(grain));
  }
  return dates;
}

/**
 * @param dimensions - The dimensions to filter
 * @param filter - the filter to be applied to array of dimensions
 * @returns - filtered array
 */
function _filterDimensions(dimensions: DimensionRow[], filter?: FiliFilter): DimensionRow[] {
  if (!filter) {
    return dimensions;
  }
  return dimensions.reduce((arr: DimensionRow[], value) => {
    if (DIMENSION_OPS[filter.operator](filter.values, value, filter.field)) {
      arr.push(value);
    }
    return arr;
  }, []);
}

/**
 * @param dimension - dimension to fake values for
 * @param count - number of values dimension should have
 * @returns list of object with id + description
 */
type DimensionRow = Record<string, string | null>;
function _fakeDimensionValues(dimension: FiliDimension, count: number): DimensionRow[] {
  let fakeValues: DimensionRow[] = [];

  for (let i = 0; i < count; i++) {
    let key = null;
    // used to generate alternative primary keys for dimensions that don't use `id` as their primaryKey (in this case uses `key` instead)
    if (dimension.name === 'multiSystemId') {
      key = `k${i + 1}`;
    }
    fakeValues.push({
      id: `${i + 1}`,
      description: faker.commerce.productName(),
      ...(key ? { key } : {})
    });
  }

  return fakeValues;
}

/**
 * @param dimension - dimension to get values for
 * @returns list of object with id + description
 */
function _getDimensionValues(dimension: FiliDimension, filter?: FiliFilter) {
  // Return cached values, or fake new ones
  let values =
    DIMENSION_VALUE_MAP[dimension.name] ||
    (DIMENSION_VALUE_MAP[dimension.name] = _fakeDimensionValues(dimension, faker.random.number({ min: 3, max: 5 })));
  return _filterDimensions(values, filter);
}

/**
 * Load fixed dimension values placed under mirage/bard-lite/dimensions
 */
function _loadPredefinedDimensions(): void {
  const dimensionFixturesRegExp = new RegExp(`mirage/bard-lite/dimensions/(.*)`);
  const fixtureEntries = Object.keys(global.requirejs.entries).filter(
    key => !key.endsWith('.jshint') && !key.endsWith('.lint-test') && dimensionFixturesRegExp.test(key)
  );

  fixtureEntries.forEach(requirejsKey => {
    const [, dimensionKey] = dimensionFixturesRegExp.exec(requirejsKey) || [];
    DIMENSION_VALUE_MAP[dimensionKey] = global.require(requirejsKey).default;
  });
}

export default function(
  this: Server,
  metricBuilder = (_metric: string, _row: ResponseRow, _dimKey: string): number => {
    return Number(faker.finance.amount());
  }
) {
  _loadPredefinedDimensions();

  this.get('/data/*path', function(_db, request) {
    faker.seed(request.url.length);
    let [table, grain, ...dimensionPaths] = request.params.path.split('/') as [string, Grain] & string[];
    const dimensions = dimensionPaths
      .filter(d => d.length > 0)
      .sort()
      .map(d => parseDimension(d));

    if (table === 'protected') {
      return new Response(403, {}, { error: 'user not allowed to query this table' });
    }

    // Get date range from query params + grain
    const [start, end] = request.queryParams.dateTime.split('/');
    let dates = _getDates(grain, start, end);
    let filters: FiliFilter[] = [];
    if (request.queryParams.filters) {
      filters = parseFilters(request.queryParams.filters);
    }

    // Convert each date into a row of data
    let rows: ResponseRow[] = dates.map(date => {
      return {
        dateTime: date.format(API_DATE_FORMAT)
      };
    });

    // Add id and desc for each dimension
    dimensions.forEach(dimension => {
      rows = rows.reduce((newRows: ResponseRow[], currentRow) => {
        const dimensionFilter = filters.find(f => f.dimension === dimension.name);
        let dimensionValues = _getDimensionValues(dimension, dimensionFilter);

        return newRows.concat(
          dimensionValues.map(value => {
            let newRow = { ...currentRow };
            Object.keys(value).forEach(key => {
              let field = key;
              if (key === 'description') {
                field = 'desc';
              }
              if (dimension.show.length !== 0 && dimension.show.includes(field)) {
                newRow[`${dimension.name}|${field}`] = value[key];
              }
            });
            return newRow;
          })
        );
      }, []);
    });

    let havings: Havings = {};
    if (request.queryParams.having) {
      havings = parseHavings(request.queryParams.having);
    }

    // Add each metric
    rows = rows
      .map(row => {
        const dimensionKey = dimensions.map(d => `${d}=${row[`${d}|id`]}`).join('_');
        const metrics = parseMetrics(request.queryParams.metrics).reduce((metricsObj: ResponseRow, metric) => {
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

  this.get('/dimensions/:dimension/values', function(_db, request) {
    faker.seed(request.url.length);
    let dimension = request.params.dimension,
      rows = _getDimensionValues({ name: dimension, show: [] });

    // Handle value filters
    if ('filters' in request.queryParams) {
      const { values } = parseFilters(request.queryParams.filters)[0],
        fieldMatch = request.queryParams.filters.match(/\|(id|key)/);

      rows =
        fieldMatch && fieldMatch.length > 0
          ? rows.filter(row => {
              const fieldValue = row[fieldMatch[1]];
              return fieldValue && values.includes(fieldValue);
            })
          : rows.filter(row => values.some(value => row.description?.toLowerCase().includes(value.toLowerCase())));
    }

    return { rows };
  });

  this.get('/dimensions/:dimension/search', function(_db, request) {
    let dimension = request.params.dimension,
      rows = _getDimensionValues({ name: dimension, show: [] }),
      { query } = request.queryParams;

    if (query) {
      let values = query
        .toLowerCase()
        .split(/\s+/)
        .map(v => v.trim())
        .filter(_ => _);

      rows = rows.filter(row => {
        let rowValue = Object.values(row)
          .join(' ')
          .toLowerCase();
        return values.every(value => rowValue.includes(value));
      });
    }

    return { rows };
  });
}
