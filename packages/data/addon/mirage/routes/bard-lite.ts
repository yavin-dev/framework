/**
 * Copyright 2021, Yahoo Holdings Inc.
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
  parseMetrics,
} from './bard-lite-parsers';
import { getPeriodForGrain, Grains } from 'navi-data/utils/date';
import type { Grain } from 'navi-data/utils/date';
import { groupBy, difference } from 'lodash-es';
import type { GrainWithAll } from 'navi-data/serializers/metadata/bard';

const API_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';
const DATA_EPOCH = '2010-01-01';
const DIMENSION_VALUE_MAP: Record<string, DimensionRow[]> = {};
const MISSING_INTERVALS = [
  '2018-11-12 00:00:00.000/2018-11-14 00:00:00.000',
  '2018-11-15 00:00:00.000/2018-11-16 00:00:00.000',
];
const HAVING_OPS = {
  gt: (values: string[], metricValue: number) => parseFloat(`${metricValue}`) > parseFloat(values[0]),
  gte: (values: string[], metricValue: number) => parseFloat(`${metricValue}`) >= parseFloat(values[0]),
  lt: (values: string[], metricValue: number) => parseFloat(`${metricValue}`) < parseFloat(values[0]),
  lte: (values: string[], metricValue: number) => parseFloat(`${metricValue}`) <= parseFloat(values[0]),
  eq: (values: string[], metricValue: number) => parseFloat(`${metricValue}`) === parseFloat(values[0]),
  neq: (values: string[], metricValue: number) => parseFloat(`${metricValue}`) !== parseFloat(values[0]),
  bet: (values: string[], metricValue: number) =>
    parseFloat(values[0]) < parseFloat(`${metricValue}`) && parseFloat(`${metricValue}`) < parseFloat(values[1]),
  nbet: (values: string[], metricValue: number) => !HAVING_OPS.bet(values, metricValue),
};
const DIMENSION_OPS = {
  in: (filterValues: string[], value: DimensionRow, field: string) => {
    const dimFieldValue = value[field];
    if (filterValues.length === 1 && filterValues[0] === '""' && dimFieldValue === null) {
      return true;
    }
    return dimFieldValue && filterValues.includes(dimFieldValue);
  },
  notin: (filterValues: string[], value: DimensionRow, field: string) => !DIMENSION_OPS.in(filterValues, value, field),
  contains: (filterValues: string[], value: DimensionRow, field: string) =>
    filterValues.some((v) => value[field]?.includes(v)),
  // TODO: fili date dimension support
  lte: () => true,
  gte: () => true,
  bet: () => true,
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
function _getDates(grain: GrainWithAll, start: string, end: string) {
  const ERROR_MSG_ZERO_LENGTH_INTERVAL = `Date time cannot have zero length interval. ${start}/${end}.`;

  if (start === end) {
    throw new Error(ERROR_MSG_ZERO_LENGTH_INTERVAL);
  }

  let nonAllGrain;
  let startDate, endDate;
  let startMacro, endMacro;

  if (grain === 'all') {
    let validInterval = true;
    const regex = (macro: string) => new RegExp(`^(?<macro>(${macro}))(?<grain>[A-Z][a-z]+)$`);

    // try matching for currentDay, currentWeek etc.
    let match = start.match(regex('current'))?.groups;
    startMacro = match?.macro;
    const startGrain = match?.grain?.toLowerCase() as Grain;
    // validate grain
    if (startGrain && !Grains.includes(startGrain)) {
      validInterval = false;
    }
    // validate date if not macro
    if (!startMacro && !start.startsWith('P') && !moment(start).isValid()) {
      validInterval = false;
    }

    // try matching for currentDay, nextWeek etc.
    match = end.match(regex('current|next'))?.groups;
    endMacro = match?.macro;
    nonAllGrain = (match?.grain?.toLowerCase() ?? 'day') as Grain;
    // validate grain
    if (!Grains.includes(nonAllGrain)) {
      validInterval = false;
    }
    // validate date if not macro
    if (!endMacro && !moment(end).isValid()) {
      validInterval = false;
    }

    if (!validInterval) {
      throw new Error(`Invalid interval for 'all' grain. ${start}/${end}.`);
    }
  } else {
    nonAllGrain = grain;
  }

  const nonAllIsoGrain = nonAllGrain === 'week' ? 'isoWeek' : nonAllGrain; // need to use isoweek, which is what real ws uses

  const current = moment().startOf(nonAllIsoGrain);
  const next = current.clone().add(1, getPeriodForGrain(nonAllIsoGrain));
  if ([end, endMacro].includes('current')) {
    endDate = current;
  } else if ([end, endMacro].includes('next')) {
    endDate = next;
  } else {
    endDate = moment.min(moment(end, API_DATE_FORMAT), next);
  }
  if ([start, startMacro].includes('current')) {
    startDate = current;
  } else {
    startDate = start.startsWith('P')
      ? endDate.clone().subtract(moment.duration(start))
      : moment(start, API_DATE_FORMAT);
  }

  let currentDate = moment.max(startDate, moment.utc(DATA_EPOCH)),
    dates = [];

  if (currentDate.isSameOrAfter(endDate)) {
    throw new Error(ERROR_MSG_ZERO_LENGTH_INTERVAL);
  }

  // handle "all" time grain
  if (grain === 'all') {
    return [moment(currentDate, API_DATE_FORMAT)];
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
    let extraKeys = {};
    // used to generate alternative primary keys for dimensions that don't use `id` as their primaryKey (in this case uses `key` instead)
    if (dimension.name === 'multiSystemId') {
      extraKeys = { key: `k${i + 1}`, other: `o${i + 1}` };
    }
    fakeValues.push({
      id: `${i + 1}`,
      description: faker.commerce.productName(),
      ...extraKeys,
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
    (key) => !key.endsWith('.jshint') && !key.endsWith('.lint-test') && dimensionFixturesRegExp.test(key)
  );

  fixtureEntries.forEach((requirejsKey) => {
    const [, dimensionKey] = dimensionFixturesRegExp.exec(requirejsKey) || [];
    DIMENSION_VALUE_MAP[dimensionKey] = global.require(requirejsKey).default;
  });
}

export default function (
  this: Server,
  metricBuilder = (_metric: string, _row: ResponseRow, _dimKey: string): number => {
    return Number(faker.finance.amount());
  },
  dateTimeFormatter = (date: moment.Moment, _grain: GrainWithAll, _table: string) => {
    return date.format(API_DATE_FORMAT);
  }
) {
  _loadPredefinedDimensions();

  this.get('/data/*path', function (_db, request) {
    faker.seed(request.url.length);
    let [table, grain, ...dimensionPaths] = request.params.path.split('/') as [string, GrainWithAll] & string[];
    const hasRollUpDim = dimensionPaths.includes('__rollupMask');
    const dimensions = dimensionPaths
      .filter((d) => d.length > 0)
      .filter((dim) => dim !== '__rollupMask')
      .sort()
      .map((d) => parseDimension(d));

    if (table === 'protected') {
      return new Response(403, {}, { error: 'user not allowed to query this table' });
    }

    // Get date range from query params + grain
    const [start, end] = request.queryParams.dateTime.split('/');
    let dates;
    try {
      dates = _getDates(grain, start, end);
    } catch (e) {
      return new Response(
        400,
        {},
        {
          description: e.message,
        }
      );
    }
    let filters: FiliFilter[] = [];
    if (request.queryParams.filters) {
      filters = parseFilters(request.queryParams.filters);
    }

    // Convert each date into a row of data
    let rows: ResponseRow[] = dates.map((date) => ({ dateTime: dateTimeFormatter(date, grain, table) }));

    // Add id and desc for each dimension
    dimensions.forEach((dimension) => {
      rows = rows.reduce((newRows: ResponseRow[], currentRow) => {
        const dimensionFilter = filters.find((f) => f.dimension === dimension.name);
        let dimensionValues = _getDimensionValues(dimension, dimensionFilter);

        return newRows.concat(
          dimensionValues.map((value) => {
            let newRow = { ...currentRow };
            Object.keys(value).forEach((key) => {
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
      .map((row) => {
        const dimensionKey = dimensions
          .map((d) => {
            const fields = d.show.length === 0 ? ['id', 'desc'] : d.show;
            return fields.map((field) => `${d.name}|${field}=${row[`${d.name}|${field}`]}`).join(',');
          })
          .join(';');
        const metrics = parseMetrics(request.queryParams.metrics).reduce((metricsObj: ResponseRow, metric) => {
          const having = havings[metric];
          const metricValue = metricBuilder(metric, row, dimensionKey);
          if (!having || HAVING_OPS[having.operator](having.values, metricValue)) {
            metricsObj[metric] = metricValue;
          }
          return metricsObj;
        }, {});

        Object.keys(metrics).forEach((metric) => (row[metric] = metrics[metric]));
        return row;
      })
      .filter((r) => r !== undefined);

    let missingIntervals = request.queryParams.metrics.includes('uniqueIdentifier') ? MISSING_INTERVALS : undefined;

    //lets do subtotal total stuff
    const processedDims: string[] = [];
    const requestDimensionNames: string[] = dimensions.map((dim) => dim.name);
    if (request.queryParams.rollupTo || request.queryParams.rollupGrandTotal) {
      let rollupDimensions: string[] = [];
      if (request.queryParams.rollupTo) {
        rollupDimensions = request.queryParams.rollupTo.split(',');
      }
      let groupedRows: any = [[...rows]];
      const metrics = parseMetrics(request.queryParams.metrics);
      const getMask = (rolledupDims: string[]) => {
        const rollupDimensionMask = ['dateTime', ...requestDimensionNames];
        const flagMap = rollupDimensionMask.map((rolledDim) => (rolledupDims.includes(rolledDim) ? 1 : 0));
        return String(parseInt(flagMap.join(''), 2));
      };
      const fullMask = getMask(['dateTime', ...requestDimensionNames]);

      let grandTotalRow;

      if (request.queryParams.rollupGrandTotal) {
        grandTotalRow = rows.reduce((acc: any, row) => {
          if (acc === null) {
            acc = {};
            Object.keys(row).forEach((key) => (acc[key] = null));
            if (hasRollUpDim) {
              acc.__rollupMask = '0';
            }
          }

          metrics.forEach((metric) => {
            acc[metric] = acc[metric] + Number(row[metric]);
          });

          if (hasRollUpDim) {
            row.__rollupMask = fullMask;
          }
          return acc;
        }, null);
      } else {
        rows = rows.map((row) => {
          if (hasRollUpDim) {
            row.__rollupMask = fullMask;
          }
          return row;
        });
      }

      rollupDimensions.forEach((dim) => {
        groupedRows = groupedRows.map((row: any) => {
          let groupedRow = Object.values(groupBy(row, dim === 'dateTime' ? dim : `${dim}|id`));
          groupedRow = groupedRow.reduce((aggAcc, aggRow) => {
            const subtotalRow = aggRow.reduce((acc, row) => {
              if (row.__rollupMask !== fullMask) {
                //subtotal row, skip
                return acc;
              }
              const presentDims = [...processedDims, dim];
              presentDims.forEach((dim) => {
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

              metrics.forEach((metric) => {
                if (!acc[metric]) {
                  acc[metric] = 0;
                }
                acc[metric] = Number(acc[metric]) + Number(row[metric]);
              });

              const nullDims = difference(['dateTime', ...dimensions], [...processedDims, dim]);
              nullDims.forEach((nullDim) => {
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
        if (groupedRows.length === 1) {
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
          numberOfResults: rows.length,
        },
        missingIntervals,
      },
    };
  });

  this.get('/dimensions/:dimension/values', function (_db, request) {
    faker.seed(request.url.length);
    const dimension = request.params.dimension;
    const { filters, page, perPage } = request.queryParams;
    let rows = _getDimensionValues({ name: dimension, show: [] });
    let meta;
    // Handle value filters
    if (filters) {
      const { values } = parseFilters(request.queryParams.filters)[0];
      const fieldMatch = request.queryParams.filters.match(/\|(id|key)/);

      rows =
        fieldMatch && fieldMatch.length > 0
          ? rows.filter((row) => {
              const fieldValue = row[fieldMatch[1]];
              return fieldValue && values.includes(fieldValue);
            })
          : rows.filter((row) => values.some((value) => row.description?.toLowerCase().includes(value.toLowerCase())));
    }
    if (page && perPage) {
      const pageNum = Number(page);
      const perPageNum = Number(perPage);
      const skipped = (pageNum - 1) * perPageNum;
      const totalResults = rows.length;
      rows = rows.slice(skipped);
      rows = rows.slice(0, perPageNum);
      meta = {
        pagination: {
          currentPage: pageNum,
          rowsPerPage: perPageNum,
          numberOfResults: totalResults,
        },
      };
    }

    return {
      rows,
      ...(meta ? { meta } : {}),
    };
  });

  this.get('/dimensions/:dimension/search', function (_db, request) {
    let dimension = request.params.dimension,
      rows = _getDimensionValues({ name: dimension, show: [] }),
      { query } = request.queryParams;

    if (query) {
      let values = query
        .toLowerCase()
        .split(/\s+/)
        .map((v) => v.trim())
        .filter((_) => _);

      rows = rows.filter((row) => {
        let rowValue = Object.values(row).join(' ').toLowerCase();
        return values.every((value) => rowValue.includes(value));
      });
    }

    return { rows };
  });
}
