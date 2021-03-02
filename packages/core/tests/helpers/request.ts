import { assert } from '@ember/debug';
import { getContext } from '@ember/test-helpers';
import { TestContext } from 'ember-test-helpers';
import StoreService from '@ember-data/store';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

export type Column = { cid?: string; field: string; parameters?: Record<string, string> };

/**
 * @function buildTestRequest
 * @param metrics - array of metrics
 * @param dimensions - array of dimensions
 * @param intervals - interval
 * @param timeGrain - timegrain
 * @returns request object
 */
export function buildTestRequest(
  metrics: Column[] = [],
  dimensions: Column[] = [],
  interval = { start: 'P7D', end: 'current' },
  timeGrain = 'day'
): RequestFragment {
  assert('interval must be an object', !Array.isArray(interval) && interval.start && interval.end);
  const store = (getContext() as TestContext).owner.lookup('service:store') as StoreService;

  return store.createFragment('bard-request-v2/request', {
    table: 'network',
    filters: [
      {
        type: 'timeDimension',
        field: 'network.dateTime',
        parameters: { grain: timeGrain },
        operator: 'bet',
        values: [interval.start, interval.end],
        source: 'bardOne',
      },
    ],
    sorts: [],
    limit: null,
    dataSource: 'bardOne',
    requestVersion: '2.0',
    columns: [
      {
        type: 'timeDimension',
        field: 'network.dateTime',
        parameters: { grain: timeGrain },
        source: 'bardOne',
      },
      ...metrics.map(({ cid, field, parameters = {} }) => {
        return {
          cid,
          type: 'metric',
          field: field,
          parameters,
          source: 'bardOne',
        };
      }),
      ...dimensions.map(({ cid, field, parameters = {} }) => {
        return {
          cid,
          type: 'dimension',
          field: field,
          parameters,
          source: 'bardOne',
        };
      }),
    ],
  });
}
