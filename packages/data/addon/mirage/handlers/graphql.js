/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import createGraphQLHandler from 'ember-cli-mirage-graphql/handler';
import schema from 'navi-data/gql/schema';
import gql from 'graphql-tag';
import faker from 'faker';
import moment from 'moment';

const API_DATE_FORMAT = 'YYYY-MM-DD';
const ASYNC_RESPONSE_DELAY = 5000; // ms before async api response result is populated

function _getSeedForRequest(table, args, fields) {
  const tableLength = table.length;
  const argsLength = Object.keys(args).join(' ').length;
  const fieldsLength = fields.join(' ').length;
  return tableLength + argsLength + fieldsLength;
}

/**
 * @param {string} filter
 * @returns 3 sequential days in format YYYY-MM-DD ending on today
 */
function _getDates(/* filter */) {
  // TODO: Generate dates based on filters on time dimensions and the chosen grain
  let day = moment();
  let days = [];
  for (let i = 0; i < 3; i++) {
    days.push(moment(day).format(API_DATE_FORMAT));
    day = moment(day).subtract(1, 'days');
  }

  return days;
}

/**
 * @param {Number} n
 * @returns n random dimension values
 */
function _dimensionValues(n) {
  const vals = [];
  for (let i = 0; i < n; i++) {
    vals.push(faker.commerce.productName());
  }

  return vals;
}

/**
 * @param {String} queryStr - stringified graphql query
 * @returns {Object}
 */
function _parseGQLQuery(queryStr) {
  const queryAST = gql`
    ${queryStr}
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

function _getResponseBody(db, parent) {
  // Create mocked response for an async query
  const { createdOn, query } = parent;
  const responseTime = Date.now();

  // Only respond if query was created over 5 seconds ago
  if (responseTime - createdOn >= ASYNC_RESPONSE_DELAY) {
    parent.status = 'COMPLETE';

    // TODO: get args from _parseGQLQuery result and handle filtering
    const { table, args, fields } = _parseGQLQuery(JSON.parse(query).query || '');
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

      const dates = columns.timeDimensions.length > 0 ? _getDates(args.filter) : [];

      // Convert each date into a row of data
      // If no time dimension is sent, just return a single row
      let rows = dates.length ? dates.map(dateTime => ({ dateTime })) : [{}];

      // Add each dimension
      columns.dimensions.forEach(dimension => {
        rows = rows.reduce((newRows, currentRow) => {
          const dimensionValues = _dimensionValues(faker.random.number({ min: 3, max: 5 }));

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
        return records;
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
