import { RequestV2 } from 'navi-data/adapters/facts/interface';
import RequestV2Builder from 'navi-data/builder/requestV2';
import { module, test } from 'qunit';

module('Unit | Builder | Request V2', function() {
  test('Can build requests', assert => {
    assert.expect(1);
    const request = new RequestV2Builder();
    const built: RequestV2 = request
      .setTable('clicks')
      .addTimeRangeFilter('day', 'P3D', 'current')
      .addMetric('clicks', { aggregation: '2DayAvg', trend: 'YoY' })
      .addDimension('browser')
      .addFilter('dimension', 'browser', { field: 'id' }, 'eq', ['chrome'])
      .addFilter('metric', 'clicks', { aggregation: '2DayAvg', trend: 'YoY' }, 'gt', [80000])
      .setLimit(80000)
      .addSort('metric', 'clicks', { aggregation: '2DayAvg', trend: 'YoY' }, 'desc')
      .build();

    //strip out cid for easy compare
    built.columns = built.columns.map(col => {
      delete col.cid;
      return col;
    });

    assert.deepEqual(
      built,
      {
        table: 'clicks',
        columns: [
          {
            field: 'clicks.dateTime',
            parameters: {
              grain: 'day'
            },
            type: 'timeDimension'
          },
          {
            field: 'clicks',
            parameters: {
              aggregation: '2DayAvg',
              trend: 'YoY'
            },
            type: 'metric'
          },
          {
            field: 'browser',
            parameters: {},
            type: 'dimension'
          }
        ],
        filters: [
          {
            field: 'clicks.dateTime',
            operator: 'bet',
            parameters: {
              grain: 'day'
            },
            type: 'timeDimension',
            values: ['P3D', 'current']
          },
          {
            field: 'browser',
            operator: 'eq',
            parameters: {
              field: 'id'
            },
            type: 'dimension',
            values: ['chrome']
          },
          {
            field: 'clicks',
            operator: 'gt',
            parameters: {
              aggregation: '2DayAvg',
              trend: 'YoY'
            },
            type: 'metric',
            values: [80000]
          }
        ],
        sorts: [
          {
            direction: 'desc',
            field: 'clicks',
            parameters: {
              aggregation: '2DayAvg',
              trend: 'YoY'
            },
            type: 'metric'
          }
        ],
        limit: 80000,
        requestVersion: '2.0',
        dataSource: 'bardOne'
      },
      'Builds correct request'
    );
  });

  test('Build from base request', assert => {
    assert.expect(1);
    const baseRequest = new RequestV2Builder();
    const built = baseRequest
      .setTable('clicks')
      .addTimeRangeFilter('day', 'P1D', 'current')
      .build();

    const fullRequest = new RequestV2Builder(built);
    const fullBuild = fullRequest
      .addMetric('clicks')
      .addDimension('browser')
      .addFilter('metric', 'clicks', {}, 'gt', [10000])
      .build();

    //strip out cid for easy compare
    fullBuild.columns = fullBuild.columns.map(col => {
      delete col.cid;
      return col;
    });

    assert.deepEqual(
      fullBuild,
      {
        columns: [
          {
            field: 'clicks.dateTime',
            parameters: {
              grain: 'day'
            },
            type: 'timeDimension'
          },
          {
            field: 'clicks',
            parameters: {},
            type: 'metric'
          },
          {
            field: 'browser',
            parameters: {},
            type: 'dimension'
          }
        ],
        dataSource: 'bardOne',
        filters: [
          {
            field: 'clicks.dateTime',
            operator: 'bet',
            parameters: {
              grain: 'day'
            },
            type: 'timeDimension',
            values: ['P1D', 'current']
          },
          {
            field: 'clicks',
            operator: 'gt',
            parameters: {},
            type: 'metric',
            values: [10000]
          }
        ],
        limit: null,
        requestVersion: '2.0',
        sorts: [],
        table: 'clicks'
      },
      'Building from base request'
    );
  });
});
