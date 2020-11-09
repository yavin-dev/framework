import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { LegacyLineChartConfig, normalizeLineChartV2 } from 'navi-core/serializers/line-chart';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import { LineChartConfig } from 'navi-core/models/line-chart';
import { SeriesType } from 'navi-core/chart-builders/base';

const TestRequest: RequestV2 = {
  table: 'table1',
  dataSource: 'test',
  limit: null,
  requestVersion: '2.0',
  filters: [],
  columns: [
    {
      cid: 'cid_age(field=id)',
      type: 'dimension',
      field: 'age',
      parameters: {
        field: 'id'
      }
    },
    {
      cid: 'cid_property(field=id)',
      type: 'dimension',
      field: 'property',
      parameters: {
        field: 'id'
      }
    },
    {
      cid: 'cid_metricName(param=val)',
      type: 'metric',
      field: 'metricName',
      parameters: {
        param: 'val'
      }
    }
  ],
  sorts: []
};

function makeConfig(version: 1 | 2 = 2, type: SeriesType, config?: any): LegacyLineChartConfig | LineChartConfig {
  return {
    type: 'line-chart',
    version,
    metadata: {
      axis: {
        y: {
          series: {
            type,
            config: config || {}
          }
        }
      }
    }
  };
}

module('Unit | Serializer | line chart', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('normalizeLineChartV2 - metric', function(assert) {
    const metricConfig = makeConfig(1, 'metric', {
      metrics: [{ metric: 'metricName', parameters: { param: 'val' } }]
    });

    assert.deepEqual(
      normalizeLineChartV2(TestRequest, metricConfig),
      makeConfig(2, 'metric'),
      'the metrics config is removed when updating line chart config to v2'
    );
  });

  test('normalizeLineChartV2 - dimension', function(assert) {
    const dimensionConfig = makeConfig(1, 'dimension', {
      metric: 'metricName(param=val)',
      dimensions: [{ name: 'Cool name', values: { age: '-1', property: '2' } }]
    });

    assert.deepEqual(
      normalizeLineChartV2(TestRequest, dimensionConfig),
      makeConfig(2, 'dimension', {
        metricCid: 'cid_metricName(param=val)',
        dimensions: [
          {
            name: 'Cool name',
            values: {
              'cid_age(field=id)': '-1',
              'cid_property(field=id)': '2'
            }
          }
        ]
      }),
      'a dimension series updates the metric key to be a cid, and updates dimension series values to use cid'
    );

    const dimensionConfigBadMetricName = makeConfig(1, 'dimension', {
      metric: 'metricName',
      dimensions: []
    });

    assert.throws(
      () => {
        normalizeLineChartV2(TestRequest, dimensionConfigBadMetricName);
      },
      /Error: The metricName metric should exist and have a cid/,
      'a dimension throws an error when trying to match up a nonexistent metric'
    );

    const dimensionConfigBadSeries = makeConfig(1, 'dimension', {
      metric: 'metricName(param=val)',
      dimensions: [{ name: 'Name', values: { gender: 0 } }]
    });

    assert.throws(
      () => {
        normalizeLineChartV2(TestRequest, dimensionConfigBadSeries);
      },
      /Could not find a matching column for dimension gender/,
      'a dimension throws an error when trying to match up a nonexistent metric'
    );
  });

  test('normalizeLineChartV2 - dateTime', function(assert) {
    const dateTimeConfig = makeConfig(1, 'dateTime', {
      metric: 'metricName(param=val)',
      timeGrain: 'day'
    });

    assert.deepEqual(
      normalizeLineChartV2(TestRequest, dateTimeConfig),
      makeConfig(2, 'dateTime', {
        metricCid: 'cid_metricName(param=val)',
        timeGrain: 'day'
      }),
      'a dateTime series updates the metric key to be a cid'
    );

    const dateTimeConfigBadMetricName = makeConfig(1, 'dateTime', {
      metric: 'metricName'
    });

    assert.throws(
      () => {
        normalizeLineChartV2(TestRequest, dateTimeConfigBadMetricName);
      },
      /Error: The metricName metric should exist and have a cid/,
      'a dimension throws an error when trying to match up a nonexistent metric'
    );
  });
});
