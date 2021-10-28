/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { createGraphQLHandler, mirageGraphQLFieldResolver } from '@miragejs/graphql';
import graphQLSchema from '../../gql/schema.graphql';
import gql from 'graphql-tag';
import faker from 'faker';
import moment from 'moment';
import { capitalize } from '@ember/string';
import { orderBy, invert } from 'lodash-es';
import { parse } from '@rsql/parser';

const ASYNC_RESPONSE_DELAY = 2000; // ms before async api response result is populated
const DATE_FORMATS = {
  hour: 'YYYY-MM-DD HH:MM:SS',
  day: 'YYYY-MM-DD',
  isoweek: 'YYYY-MM-DD',
  month: 'YYYY MMM',
  quarter: 'YYYY [Q]Q',
  year: 'YYYY',
};
const GRAINS = Object.keys(DATE_FORMATS);
const TIME_DIMENSION_REGEX = new RegExp(
  `(.+)(${Object.keys(DATE_FORMATS)
    .map((grain) => capitalize(grain))
    .join('|')})`
);
const REMOVE_TABLE_REGEX = /.+?\.(.+)/;
const OPERATORS = {
  eq: '==',
  neq: '!=',
  isIn: '=in=',
  isInInsensitive: '=ini=',
  notIn: '=out=',
  isNull: '=isnull=true',
  notNull: '=isnull=false',
  lt: '=lt=',
  gt: '=gt=',
  le: '=le=',
  ge: '=ge=',
};
const FILTER_OPS = {
  [OPERATORS.lt]: ([filterVal], vals) => vals.filter((val) => val < filterVal),
  [OPERATORS.gt]: ([filterVal], vals) => vals.filter((val) => val > filterVal),
  [OPERATORS.le]: ([filterVal], vals) => vals.filter((val) => val <= filterVal),
  [OPERATORS.ge]: ([filterVal], vals) => vals.filter((val) => val >= filterVal),
  [OPERATORS.isIn]: (filterVals, vals) => vals.filter((val) => filterVals.includes(val)),
  [OPERATORS.isInInsensitive]: ([filterVal], vals) =>
    vals.filter((val) => {
      const lowerVal = val.toLowerCase();
      const lowerFilterVal = filterVal.toLowerCase();
      //If filterVal is wrapped in wildcard operators, match all values that contain the filterVal
      const match = /\*(.*)\*/.exec(lowerFilterVal);
      return match ? lowerVal.includes(match[1]) : lowerVal === lowerFilterVal;
    }),
  [OPERATORS.notIn]: (filterVals, vals) => vals.filter((val) => !filterVals.includes(val)),
  [OPERATORS.isNull]: (_, vals) => vals.filter((val) => !val),
  [OPERATORS.notNull]: (_, vals) => vals.filter(Boolean),
  [OPERATORS.eq]: ([filterVal], vals) =>
    vals.filter((val) => {
      //If filterVal is wrapped in wildcard operators, match all values that contain the filterVal
      const match = /\*(.*)\*/.exec(filterVal);
      return match ? val.includes(match[1]) : val === filterVal;
    }),
  [OPERATORS.neq]: ([filterVal], vals) => vals.filter((val) => val !== filterVal),
};
const FILTER_REGEX = new RegExp(`(.*?)(?:\\((.+?)\\))?(${Object.values(OPERATORS).join('|')})\\((.+?)\\)`);

//create an inclusive interval of dates based on filter values and operator
const DATE_FILTER_OPS = {
  [OPERATORS.lt]: ([val], grain) => [null, moment.utc(val).subtract(1, grain)],
  [OPERATORS.gt]: ([val], grain) => [moment.utc(val).add(1, grain), null],
  [OPERATORS.le]: ([val]) => [null, moment.utc(val)],
  [OPERATORS.ge]: ([val]) => [moment.utc(val), null],
  [OPERATORS.isIn]: () => [null, null], //TODO: Not sure if the following operators are really supported for dates
  [OPERATORS.isNull]: () => [null, null],
  [OPERATORS.notNull]: () => [null, null],
  [OPERATORS.isEmpty]: () => [null, null],
  [OPERATORS.eq]: () => [null, null],
  [OPERATORS.neq]: () => [null, null],
};

/**
 *
 * @param {String} table - table name
 * @param {Object} args - args and their values
 * @param {String[]} fields - requested fields
 * @returns {Number} - number to use as faker seed
 */
function _getSeedForRequest(table, args, fields) {
  const tableLength = table.length;
  const skippedArgs = ['first', 'after', 'sort'];
  const argsLength = Object.keys(args)
    .filter((key) => !skippedArgs.includes(key))
    .join(' ').length;
  const fieldsLength = fields.join(' ').length;
  return tableLength + argsLength + fieldsLength;
}

/**
 *
 * @param {Object[]} filters - time dimension filter objects with operator, values, and grain
 * @returns {Array<Moment|null>} - lowerbound and upperbound of moments for interval
 */
function _createInterval(filters) {
  const intervals = filters.map((f) => DATE_FILTER_OPS[f.operator](f.values, f.grain));
  const lowerLimits = intervals.map((interval) => interval[0]).filter(Boolean);
  const lowerBound = lowerLimits.length ? moment.max(lowerLimits) : null;

  const upperLimits = intervals.map((interval) => interval[1]).filter(Boolean);
  const upperBound = upperLimits.length ? moment.min(upperLimits) : null;

  if (!upperBound && !lowerBound) {
    return [];
  }

  return !lowerBound || !upperBound || lowerBound.isSameOrBefore(upperBound) ? [lowerBound, upperBound] : [];
}

/**
 * @param {Object[]} filters - time dimension filter objects with operator, values, and grain
 * @returns {Object} - date intervals for each time dimension
 */
function _intervalsForFilters(filters) {
  // Group filters by their field without grain and assign grain and filterWithoutGrain properties
  const filtersWithGrain = filters.reduce((byField, filter) => {
    const [, fieldWithoutGrain, grain] = TIME_DIMENSION_REGEX.exec(filter.field);
    const filterObject = {
      ...filter,
      fieldWithoutGrain,
      grain: grain === 'Week' ? 'Isoweek' : grain,
    };
    byField[fieldWithoutGrain] = [...(byField[fieldWithoutGrain] || []), filterObject];
    return byField;
  }, {});

  return Object.keys(filtersWithGrain).reduce((acc, curr) => {
    acc[curr] = _createInterval(filtersWithGrain[curr]);
    return acc;
  }, {});
}

/**
 * @param {Array<Moment|null>} interval
 * @param {String} grain
 * @returns {Moment[]} - all the dates for the interval in the supplied time grain
 */
function _datesForInterval(interval, grain) {
  if (!interval[0] && !interval[1]) {
    return [];
  }
  let start;
  let end;
  const dates = [];

  // Default interval to at most 1 month long if start or end are null
  if (!interval[0]) {
    end = moment.utc(interval[1]).startOf(grain);
    start = moment.utc(end).subtract(1, 'month'); //Default start to 1 month before end
  } else if (!interval[1]) {
    start = interval[0].startOf(grain);
    let monthAhead = moment.utc(start).add(1, 'month');
    let current = moment.utc();
    end = monthAhead.isSameOrBefore(current) ? monthAhead.startOf(grain) : current.startOf(grain); //Default end to current or 1 month past start, whichever is closer to start
  } else {
    start = interval[0].startOf(grain);
    end = interval[1].startOf(grain);
  }
  for (let i = start; i.isSameOrBefore(end); i.add(1, grain)) {
    dates.push(moment.utc(i));
  }
  return dates;
}

/**
 * @param {Object[]} filters - filters from the request
 * @param {Object[]} requestedColumns - time dimension columns from mirage db in the columns of the request
 * @param {Object} fieldToAlias - map of field names to aliases if they exist
 * @returns rows with values for each requested time dimension
 */
function _getDates(filters, requestedColumns, fieldToAlias) {
  // Columns with buckets keyed by their field without grain where buckets are sorted by grain in ascending order
  const columns = requestedColumns.reduce((acc, col) => {
    const [, fieldWithoutGrain, grain] = TIME_DIMENSION_REGEX.exec(col.id);

    const column = {
      ...col,
      fieldWithoutGrain,
      grain: grain === 'Week' ? 'Isoweek' : grain,
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
      rows = datesForField.map((date) =>
        columnsForField.reduce((row, column) => {
          const field = REMOVE_TABLE_REGEX.exec(column.id)[1];
          const aliasedField = fieldToAlias[field] || field;
          row[aliasedField] = date.format(DATE_FORMATS[column.grain.toLowerCase()]);
          return row;
        }, {})
      );
    } else {
      rows = rows.reduce((newRows, currentRow) => {
        return [
          ...newRows,
          ...datesForField.map((date) => ({
            ...currentRow,
            ...columnsForField.reduce((row, column) => {
              const field = REMOVE_TABLE_REGEX.exec(column.id)[1];
              const aliasedField = fieldToAlias[field] || field;
              row[aliasedField] = date.format(DATE_FORMATS[column.grain.toLowerCase()]);
              return row;
            }, {}),
          })),
        ];
      }, []);
    }
  }
  return rows;
}

/**
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
  const table = selection?.name.value;

  const columnSelection = selection?.selectionSet.selections[0].selectionSet.selections[0].selectionSet.selections;
  return {
    table,
    args: selection?.arguments.reduce((argsObj, arg) => {
      argsObj[arg.name.value] = arg.value.value;
      return argsObj;
    }, {}),
    fields: columnSelection.map((field) => `${table}.${field.name.value}`),
    aliases: columnSelection.reduce((aliases, field) => {
      const alias = field.alias.value;
      if (alias) {
        aliases[alias] = field.name.value;
      }
      return aliases;
    }, {}),
  };
}

/**
 * @param {Object} args - query argument strings
 * @param {String} table - table name
 * @param {Object} aliases - alias to field name
 * @returns {Object} objects for each argument type
 */
function _parseArgs(args, table, aliases) {
  const parsers = {
    filter: (filter) =>
      filter
        .split(';')
        .filter(Boolean)
        .map((f) => {
          const [, field, parameters, operator, values] = f.match(FILTER_REGEX);
          const unaliasedField = aliases[field] || field;
          return {
            field: `${table}.${unaliasedField}`,
            parameters: parameters && Object.fromEntries(parameters.split(',').map((p) => p.split(': '))),
            operator,
            values: values.split(',').map((v) => v.match(/'(.*)'/)[1]),
            canonicalName: `${table}.${field}${parameters ? `(${parameters})` : ''}`,
          };
        }),
    sort: (sort) =>
      sort
        .split(',')
        .filter(Boolean)
        .map((s) => {
          // Keep sorts aliased because they are applied to row data which uses aliases
          let field = s;
          let direction = 'asc';
          if (s.startsWith('-')) {
            direction = 'desc';
            field = field.substring(1);
          }
          // We don't need to prefix the sort field with the table name because by the time sort is applied, the table names are removed
          return { field, direction };
        }),
    first: (limit) => limit,
    after: (after) => after,
  };

  const parsed = {};

  for (let param in args) {
    parsed[param] = parsers[param](args[param]);
  }

  return parsed;
}

/**
 * @param {MirageDatabase} db
 * @param {MirageRecord} asyncQueryRecord - async query mirage record
 * @return {String} - response body object in string form
 */
function _getResponseBody(db, asyncQueryRecord) {
  // Create mocked response for an async query
  const { createdOn, query } = asyncQueryRecord;
  const responseTime = Date.now();

  // Only respond if query was created over 5 seconds ago
  if (responseTime - createdOn >= ASYNC_RESPONSE_DELAY) {
    const { table, args, fields, aliases } = _parseGQLQuery(JSON.parse(query).query || '');
    const fieldToAlias = invert(aliases);
    const { filter = [], sort = [], first, after } = _parseArgs(args, table, aliases);
    const seed = _getSeedForRequest(table, args, fields);
    faker.seed(seed);

    if (db.elideTables.find(table) && fields.length) {
      const columns = fields.reduce(
        (groups, column) => {
          const type = ['metrics', 'dimensions', 'timeDimensions'].find((t) => db[t].find(column));

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
              filter.filter((fil) => columns.timeDimensions.includes(fil.field)),
              db.timeDimensions.find(columns.timeDimensions),
              fieldToAlias
            )
          : [{}];

      // Add each dimension
      columns.dimensions.forEach((dimension) => {
        const filterForDim = filter.find((f) => f.field === dimension); // TODO: Handle parameterized dimensions
        const dimensionValues = _dimensionValues(filterForDim);

        rows = rows.reduce((newRows, currentRow) => {
          const field = REMOVE_TABLE_REGEX.exec(dimension)[1];
          const aliasedField = fieldToAlias[field] || field;
          return [
            ...newRows,
            ...dimensionValues.map((value) => ({
              ...currentRow,
              [aliasedField]: value,
            })),
          ];
        }, []);
      });

      // Add each metric
      rows = rows.map((currRow) =>
        columns.metrics.reduce((row, metric) => {
          const field = REMOVE_TABLE_REGEX.exec(metric)[1];
          const aliasedField = fieldToAlias[field] || field;
          return {
            ...row,
            [aliasedField]: faker.finance.amount(),
          };
        }, currRow)
      );

      // sort rows
      if (sort.length) {
        rows = orderBy(
          rows,
          sort.map((r) => (row) => (Number(row[r.field]) ? Number(row[r.field]) : row[r.field])), // metric values need to be cast to numbers in order to sort properly
          sort.map((r) => r.direction)
        );
      }

      // handle limit in request
      const totalRecords = rows.length;
      if (after && after < rows.length) {
        rows = rows.slice(after);
      }
      if (first && first < rows.length) {
        rows = rows.slice(0, first);
      }

      const startNumber = after ?? 0;
      return JSON.stringify({
        data: {
          [table]: {
            edges: rows.map((node) => ({ node })),
            pageInfo: {
              startCursor: `${startNumber}`,
              endCursor: `${startNumber + rows.length}`,
              totalRecords,
            },
          },
        },
      });
    }
    return JSON.stringify({
      errors: [
        {
          message: 'Invalid query sent with AsyncQuery',
        },
      ],
    });
  }
  return null;
}

/**
 * Method to configure metadata endpoints
 */
export default function () {
  // need access to the mirage server to create a new instance of the asyncQueryResult model
  // Mirage won't allow just using a POJO to represent the asyncQueryResult
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const server = this;
  /**
   * /graphql endpoint
   */
  const graphQLHandler = createGraphQLHandler(graphQLSchema, this.schema, {
    resolvers: {
      Query: {
        table(obj, args, context, info) {
          const { op, ids, filter } = args;
          // Mirage tries to filter on the `op` argument, but this isn't truly a filter in our usecase, so we don't tell mirage about it
          if (op) {
            delete args.op;
          }
          if (filter) {
            const rsql = parse(filter);
            if ('COMPARISON' === rsql.type && '==' === rsql.operator) {
              let { selector } = rsql.left;
              if (selector.includes('.') && !selector === 'namespace.id') {
                throw new Error(`filtering on a related model is not currently supported in mirage mocks: ${filter}`);
              } else {
                // `namespace.id` doesn't match any attribute of the records, so we want to change it to `namespaceIds`
                selector = 'namespaceIds';
              }
              args[selector] = rsql.right.value;
            } else {
              throw new Error(`rsql expression is not currently supported in mirage mocks: ${filter}`);
            }
            delete args.filter;
          }
          // Mirage tries to filter on an `ids` field on each table, but we want to filter on the `id` of each table
          if (ids) {
            args.id = ids;
            delete args.ids;
          }
          return mirageGraphQLFieldResolver(obj, args, context, info);
        },
        asyncQuery(obj, args, context, info) {
          const { op, ids } = args;
          const {
            mirageSchema: { db },
          } = context;
          // Mirage tries to filter on the `op` argument, but this isn't truly a filter in our usecase, so we don't tell mirage about it
          if (op) {
            delete args.op;
          }
          // Mirage tries to filter on an `ids` field on each table, but we want to filter on the `id` of each table
          if (ids) {
            args.id = ids;
            delete args.ids;
          }
          const records = mirageGraphQLFieldResolver(obj, args, context, info);
          const asyncQueryRecord = records.edges[0]?.node;
          if (asyncQueryRecord && ['PROCESSING', 'QUEUED'].includes(asyncQueryRecord.status)) {
            const result = server.create('async-query-result', {
              httpStatus: 200,
              responseBody: _getResponseBody(db, asyncQueryRecord),
            });
            if (result.responseBody !== null) {
              db.asyncQueries.update(asyncQueryRecord.id, { status: 'COMPLETE' });
            }
            records.edges[0].node = db.asyncQueries.update(asyncQueryRecord.id, { result });
          }
          return records;
        },
      },
      Mutation: {
        asyncQuery(obj, { op, data }, context) {
          const {
            mirageSchema: {
              db: { asyncQueries },
            },
          } = context;
          data = data[0];
          const queryIds = data.id ? [data.id] : [];
          let existingQueries;
          try {
            existingQueries = asyncQueries.find(queryIds);
          } catch (e) {
            // No matching id found
            existingQueries = [];
          }
          if (op === 'UPSERT' && existingQueries.length === 0) {
            const node = asyncQueries.firstOrCreate(
              {
                id: data.id,
              },
              {
                asyncAfterSeconds: data.asyncAfterSeconds,
                requestId: data.id,
                query: data.query,
                queryType: data.queryType,
                status: data.status,
                createdOn: Date.now(),
                result: null,
              }
            );
            return { edges: [{ node }] };
          } else if (op === 'UPDATE' && existingQueries.length > 0) {
            existingQueries.forEach((query) => {
              query.status = data.status;
            });
            return { edges: existingQueries.map((node) => ({ node })) };
          } else {
            throw new Error(`Unable to ${op} when ${existingQueries.length} queries exist with id `);
          }
        },
      },
    },
  });
  this.post('/', graphQLHandler);
}
