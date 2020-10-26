import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import LineChartManifest from 'navi-core/navi-visualization-manifests/line-chart';

let ValidRequest: RequestFragment;
let Manifest: LineChartManifest;

module('Unit | Manifests | line chart', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    const store = this.owner.lookup('service:store');

    Manifest = this.owner.lookup('navi-visualization-manifest:line-chart');

    ValidRequest = store.createFragment('bard-request-v2/request', {
      dataSource: 'bardOne',
      requestVersion: '2.0',
      table: 'network',
      filters: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['current', 'next'],
          source: 'bardOne'
        }
      ],
      columns: [
        { type: 'timeDimension', field: 'network.dateTime', parameters: { grain: 'day' }, source: 'bardOne' },
        { type: 'metric', field: 'adClicks', parameters: {}, source: 'bardOne' }
      ],
      sorts: [{ type: 'metric', field: 'adClicks', parameters: {}, direction: 'asc', source: 'bardOne' }]
    });
  });

  test('invalid for single time bucket', function(assert) {
    assert.notOk(Manifest.typeIsValid(ValidRequest), 'line chart type is invalid for single time bucket');
  });

  test('valid for multiple time buckets', function(assert) {
    const request = ValidRequest.clone();
    request.dateTimeFilter!.values = ['2015-11-09 00:00:00.000', '2015-11-16 00:00:00.000'];

    assert.ok(Manifest.typeIsValid(request), 'line chart type is valid for multiple time buckets');
  });

  test('valid for potential multiple time buckets', function(assert) {
    const request = ValidRequest.clone();
    request.dateTimeFilter!.operator = 'gte';
    request.dateTimeFilter!.values = ['2015-11-09 00:00:00.000'];

    assert.ok(Manifest.typeIsValid(request), 'line chart type is valid for multiple time buckets');
  });
});
