/* eslint-disable @typescript-eslint/camelcase */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import { LegacyPieChartConfig, normalizePieChartV2 } from 'navi-core/serializers/pie-chart';
import { PieChartConfig } from 'navi-core/models/pie-chart';

function pieChartWithMetric(metric: string | { metric: string; parameters?: {} }): LegacyPieChartConfig {
  return {
    type: 'pie-chart',
    version: 1,
    metadata: {
      series: {
        type: 'dimension',
        config: {
          metric,
          dimensionOrder: ['age'],
          dimensions: [
            { name: '18-20,US', values: { age: '3', propertyCountry: 'US' } },
            { name: '21-24,US', values: { age: '4', propertyCountry: 'US' } }
          ]
        }
      }
    }
  };
}

function pieChartExpectedWithMetric(metricCid: string): PieChartConfig {
  return {
    type: 'pie-chart',
    version: 2,
    metadata: {
      series: {
        type: 'dimension',
        config: {
          metricCid,
          dimensions: [
            { name: '18-20,US', values: { cid_age: '3', cid_propertyCountry: 'US' } },
            { name: '21-24,US', values: { cid_age: '4', cid_propertyCountry: 'US' } }
          ]
        }
      }
    }
  };
}

module('Unit | Serializer | pie chart', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('normalizePieChartV2', function(assert) {
    const request: RequestV2 = {
      requestVersion: '2.0',
      table: 'network',
      dataSource: 'bardOne',
      columns: [
        { cid: 'cid_uniqueIdentifier', type: 'metric', field: 'uniqueIdentifier', parameters: {}, alias: null },
        {
          cid: 'cid_uniqueIdentifier(param=val)',
          type: 'metric',
          field: 'uniqueIdentifier',
          parameters: { param: 'val' },
          alias: null
        },
        { cid: 'cid_age', type: 'dimension', field: 'age', parameters: { field: 'id' }, alias: null },
        {
          cid: 'cid_propertyCountry',
          type: 'dimension',
          field: 'propertyCountry',
          parameters: { field: 'id' },
          alias: null
        }
      ],
      filters: [
        { type: 'dimension', field: 'propertyCountry', parameters: { field: 'id' }, operator: 'in', values: ['US'] },
        { type: 'dimension', field: 'age', parameters: { field: 'id' }, operator: 'notin', values: ['-1', '-2', '-3'] }
      ],
      sorts: [],
      limit: null
    };

    const expected = pieChartExpectedWithMetric('cid_uniqueIdentifier');
    assert.deepEqual(
      normalizePieChartV2(request, pieChartWithMetric('uniqueIdentifier')),
      expected,
      'Config with a metric name stored is successfully converted to a cid'
    );

    assert.deepEqual(
      normalizePieChartV2(request, pieChartWithMetric({ metric: 'uniqueIdentifier', parameters: {} })),
      expected,
      'Config with a metric name stored is successfully converted to a cid'
    );

    assert.deepEqual(
      normalizePieChartV2(request, pieChartWithMetric({ metric: 'uniqueIdentifier', parameters: { param: 'val' } })),
      pieChartExpectedWithMetric('cid_uniqueIdentifier(param=val)'),
      'Config with a metric name stored is successfully converted to a cid'
    );

    const v2Config = { version: 2, blah: true };
    assert.deepEqual(
      //@ts-expect-error
      normalizePieChartV2(request, v2Config),
      //@ts-expect-error
      v2Config,
      'v2 config is returned without changes'
    );
  });
});
