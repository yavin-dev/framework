/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import createGraphQLHandler from 'ember-cli-mirage-graphql/handler';
import schema from 'navi-data/gql/schema';
import gql from 'graphql-tag';
import faker from 'faker';
import moment from 'moment';
import { capitalize } from '@ember/string';
import { orderBy } from 'lodash-es';

const ASYNC_RESPONSE_DELAY = 5000; // ms before async api response result is populated
const DATE_FORMATS = {
  hour: 'YYYY-MM-DD HH:MM:SS',
  day: 'YYYY-MM-DD',
  week: 'YYYY-MM-DD',
  month: 'YYYY MMM',
  quarter: 'YYYY [Q]Q',
  year: 'YYYY'
};
const GRAINS = Object.keys(DATE_FORMATS);
const TIME_DIMENSION_REGEX = new RegExp(
  `(.+)(${Object.keys(DATE_FORMATS)
    .map(grain => capitalize(grain))
    .join('|')})`
);
const OPERATORS = {
  eq: '==',
  neq: '!=',
  isIn: '=in=',
  notIn: '=out=',
  isNull: '=isnull=true',
  notNull: '=isnull=false',
  isEmpty: '=isempty=true',
  lt: '=lt=',
  gt: '=gt=',
  le: '=le=',
  ge: '=ge='
};
const FILTER_OPS = {
  [OPERATORS.lt]: ([filterVal], vals) => vals.filter(val => val < filterVal),
  [OPERATORS.gt]: ([filterVal], vals) => vals.filter(val => val > filterVal),
  [OPERATORS.le]: ([filterVal], vals) => vals.filter(val => val <= filterVal),
  [OPERATORS.ge]: ([filterVal], vals) => vals.filter(val => val >= filterVal),
  [OPERATORS.isIn]: (filterVals, vals) => vals.filter(val => filterVals.includes(val)),
  [OPERATORS.notIn]: (filterVals, vals) => vals.filter(val => !filterVals.includes(val)),
  [OPERATORS.isNull]: (_, vals) => vals.filter(val => !val),
  [OPERATORS.notNull]: (_, vals) => vals.filter(Boolean),
  [OPERATORS.isEmpty]: () => [],
  [OPERATORS.eq]: ([filterVal], vals) => vals.filter(val => val === filterVal),
  [OPERATORS.neq]: ([filterVal], vals) => vals.filter(val => val !== filterVal)
};
const FILTER_REGEX = new RegExp(`(.*?)(?:\\((.+?)\\))?(${Object.values(OPERATORS).join('|')})\\((.+?)\\)`);

//create an inclusive interval of dates based on filter values and operator
const DATE_FILTER_OPS = {
  [OPERATORS.lt]: ([val], grain) => [null, moment(val).subtract(1, grain)],
  [OPERATORS.gt]: ([val], grain) => [moment(val).add(1, grain), null],
  [OPERATORS.le]: ([val]) => [null, moment(val)],
  [OPERATORS.ge]: ([val]) => [moment(val), null],
  [OPERATORS.isIn]: () => [null, null], //TODO: Not sure if the following operators are really supported for dates
  [OPERATORS.isNull]: () => [null, null],
  [OPERATORS.notNull]: () => [null, null],
  [OPERATORS.isEmpty]: () => [null, null],
  [OPERATORS.eq]: () => [null, null],
  [OPERATORS.neq]: () => [null, null]
};

function _getSeedForRequest(table, args, fields) {
  const tableLength = table.length;
  const argsLength = Object.keys(args).join(' ').length;
  const fieldsLength = fields.join(' ').length;
  return tableLength + argsLength + fieldsLength;
}

function _createInterval(filters) {
  const intervals = filters.map(f => DATE_FILTER_OPS[f.operator](f.values, f.grain));
  const lowerBound = moment.max(intervals.map(interval => interval[0]).filter(Boolean));
  const upperBound = moment.min(intervals.map(interval => interval[1]).filter(Boolean));

  return [lowerBound, upperBound];
}

function _intervalsForFilters(filters) {
  // Group filters by their field without grain and assign grain and filterWithoutGrain properties
  const filtersWithGrain = filters.reduce((byField, filter) => {
    const [, fieldWithoutGrain, grain] = TIME_DIMENSION_REGEX.exec(filter.field);
    const filterObject = {
      ...filter,
      fieldWithoutGrain,
      grain
    };
    byField[fieldWithoutGrain] = [...(byField[fieldWithoutGrain] || []), filterObject];
    return byField;
  }, {});

  return Object.keys(filtersWithGrain).reduce((acc, curr) => {
    acc[curr] = _createInterval(filtersWithGrain[curr]);
    return acc;
  }, {});
}

function _datesForInterval(interval, grain) {
  const dates = [];
  const start = moment(interval[0]).startOf(grain);
  const end = moment(interval[1]).startOf(grain);
  for (let i = start; i.isSameOrBefore(end); i.add(1, grain)) {
    dates.push(moment(i));
  }
  return dates;
}

/**
 * @param {Object[]} filters - filters from the request
 * @param {Object[]} requestedColumns - time dimension columns from mirage db in the columns of the request
 * @returns rows with values for each requested time dimension
 */
function _getDates(filters, requestedColumns) {
  // Columns with buckets keyed by their field without grain where buckets are sorted by grain in ascending order
  const columns = requestedColumns.reduce((acc, col) => {
    const [, fieldWithoutGrain, grain] = TIME_DIMENSION_REGEX.exec(col.id);

    const column = {
      ...col,
      fieldWithoutGrain,
      grain
    };

    // Insert column into field bucket in order
    if (!acc[fieldWithoutGrain]) {
      acc[fieldWithoutGrain] = [column];
    } else {
      let index = acc[fieldWithoutGrain].length;
      acc[fieldWithoutGrain].find((existing, i) => {
        if (GRAINS.indexOf(existing.grain) > GRAINS.indexOf(column.grain)) {
          index = i;
          return true;
        }
        return false;
      });
      acc[fieldWithoutGrain].splice(index, 0, column);
    }
    return acc;
  }, {});

  // Time Dimensions will cover the same interval regardless of grain
  // Calculate the interval for all grains of each time dimension
  const intervals = _intervalsForFilters(filters);

  let rows = [];
  for (let field in columns) {
    const columnsForField = columns[field];
    // List of moment objects for an interval with the lowest requested grain passed in
    const datesForField = _datesForInterval(intervals[field], columnsForField[0].grain);

    // For each date for a field, add each date under the field's column names as keys with the date formatted depending on the grain
    if (!rows.length) {
      rows = datesForField.map(date =>
        columnsForField.reduce((row, column) => {
          row[column.id] = date.format(DATE_FORMATS[column.grain.toLowerCase()]);
          return row;
        }, {})
      );
    } else {
      rows = rows.reduce((newRows, currentRow) => {
        return [
          ...newRows,
          ...datesForField.map(date => ({
            ...currentRow,
            ...columnsForField.reduce((row, column) => {
              row[column.id] = date.format(DATE_FORMATS[column.grain.toLowerCase()]);
              return row;
            }, {})
          }))
        ];
      }, []);
    }
  }
  return rows;
}

/**
 * @param {String} name
 * @param {Object} filter
 * @returns n random dimension values
 */
function _dimensionValues(filter = {}) {
  const { operator, values } = filter;
  const vals = [];
  const valCount = faker.random.number({ min: 3, max: 5 });
  for (let i = 0; i < valCount; i++) {
    vals.push(faker.commerce.productName());
  }

  return operator && values ? FILTER_OPS[operator](values, vals) : vals;
}

/**
 * @param {String} queryStr - stringified graphql query
 * @returns {Object}
 */
function _parseGQLQuery(queryStr) {
  const noEscapesQuery = queryStr.replace(/\\/g, '');
  const queryAST = gql`
    ${noEscapesQuery}
  `;

  // Parse requested table, columns, and filters from graphql query
  const selection = queryAST.definitions[0]?.selectionSet.selections[0];
  return {
    table: selection?.name.value,
    args: selection?.arguments.reduce((argsObj, arg) => {
      argsObj[arg.name.value] = arg.value.value;
      return argsObj;
    }, {}),
    fields: selection?.selectionSet.selections[0].selectionSet.selections[0].selectionSet.selections.map(
      field => field.name.value
    )
  };
}

function _parseArgs(args) {
  const parsers = {
    filter: filter =>
      filter
        .split(';')
        .filter(Boolean)
        .map(f => {
          const [, field, parameters, operator, values] = f.match(FILTER_REGEX);
          return {
            field,
            parameters: parameters && Object.fromEntries(parameters.split(',').map(p => p.split(': '))),
            operator,
            values: values.split(','),
            canonicalName: `${field}${parameters ? `(${parameters})` : ''}`
          };
        }),
    sort: sort =>
      sort
        .split(',')
        .filter(Boolean)
        .map(s => {
          let field = s;
          let direction = 'asc';
          if (s.startsWith('-')) {
            direction = 'desc';
            field = field.substring(1);
          }
          return { field, direction };
        }),
    first: limit => limit
  };

  const parsed = {};

  for (let param in args) {
    parsed[param] = parsers[param](args[param]);
  }

  return parsed;
}

function _getResponseBody(db, parent) {
  // Create mocked response for an async query
  const { createdOn, query } = parent;
  const responseTime = Date.now();

  // Only respond if query was created over 5 seconds ago
  if (responseTime - createdOn >= ASYNC_RESPONSE_DELAY) {
    parent.status = 'COMPLETE';

    const { table, args, fields } = _parseGQLQuery(JSON.parse(query).query || '');
    const { filter = [], sort = [], first } = _parseArgs(args);
    const seed = _getSeedForRequest(table, args, fields);
    faker.seed(seed);

    if (db.tables.find(table) && fields.length) {
      const columns = fields.reduce(
        (groups, column) => {
          const type = ['metrics', 'dimensions', 'timeDimensions'].find(t => db[t].find(column));

          if (type) {
            groups[type].push(column);
          }
          return groups;
        },
        { metrics: [], dimensions: [], timeDimensions: [] }
      );

      // Convert each date into a row of data
      // If no time dimension is sent, just return a single row
      let rows =
        columns.timeDimensions.length > 0
          ? _getDates(
              filter.filter(fil => columns.timeDimensions.includes(fil.field)),
              db.timeDimensions.find(columns.timeDimensions)
            )
          : [{}];

      // Add each dimension
      columns.dimensions.forEach(dimension => {
        const filterForDim = filter.find(f => f.field === dimension); // TODO: Handle parameterized dimensions
        const dimensionValues = _dimensionValues(filterForDim);

        rows = rows.reduce((newRows, currentRow) => {
          return [
            ...newRows,
            ...dimensionValues.map(value => ({
              ...currentRow,
              [dimension]: value
            }))
          ];
        }, []);
      });

      // Add each metric
      rows = rows.map(currRow =>
        columns.metrics.reduce(
          (row, metric) => ({
            ...row,
            [metric]: faker.finance.amount()
          }),
          currRow
        )
      );

      // handle limit in request
      if (first < rows.length) {
        rows = rows.slice(0, first);
      }

      // sort rows
      if (sort.length) {
        rows = orderBy(
          rows,
          sort.map(r => r.field),
          sort.map(r => r.direction)
        );
      }

      return JSON.stringify({
        data: {
          [table]: {
            edges: rows.map(node => ({ node }))
          }
        }
      });
    }
    return JSON.stringify({
      errors: {
        message: 'Invalid query sent with AsyncQuery'
      }
    });
  }
  return null;
}

const OPTIONS = {
  fieldsMap: {
    AsyncQuery: {
      result(_, db, parent) {
        return {
          httpStatus: 200,
          responseBody: _getResponseBody(db, parent)
        };
      }
    }
  },
  argsMap: {
    // We have to use undefined as the type key because ember-cli-mirage-graphql does not define the type property for edges and connections
    undefined: {
      ids(records, _, ids) {
        return Array.isArray(ids) ? records.filter(record => ids.includes(record.id)) : records;
      }
    },
    AsyncQueryEdge: {
      ids(records, _, ids) {
        return Array.isArray(ids) ? records.filter(record => ids.includes(record.id)) : records;
      },
      op(records) {
        return records; // op is not intended to be an actual filter in elide, but ember-cli-mirage-graphql treats it like one
      }
    }
  },
  mutations: {
    asyncQuery(connection, { op, data }, { asyncQueries }) {
      data = data[0];
      const queryIds = data.id ? [data.id] : [];
      const existingQueries = asyncQueries.find(queryIds) || [];
      if (op === 'UPSERT' && existingQueries.length === 0) {
        const node = asyncQueries.insert({
          id: data.id,
          asyncAfterSeconds: 10,
          requestId: data.id,
          query: data.query,
          queryType: data.queryType,
          status: data.status,
          createdOn: Date.now(),
          result: null
        });
        return { edges: [{ node }] };
      } else if (op === 'UPDATE' && existingQueries.length > 0) {
        existingQueries.forEach(query => {
          query.status = data.status;
        });
        return { edges: existingQueries.map(node => ({ node })) };
      } else {
        throw new Error(`Unable to ${op} when ${existingQueries.length} queries exist with id `);
      }
    }
  }
};

export default createGraphQLHandler(schema, OPTIONS);
