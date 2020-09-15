import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import MetricLabelManifest from 'navi-core/navi-visualization-manifests/metric-label';

let ValidRequest: RequestFragment;
let Manifest: MetricLabelManifest;

module('Unit | Manifests | metric label', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    const store = this.owner.lookup('service:store');

    Manifest = this.owner.lookup('navi-visualization-manifest:metric-label');

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

  test('valid for single time bucket, single row, single metric', function(assert) {
    assert.deepEqual(
      Manifest.typeIsValid(ValidRequest),
      true,
      'metric label is valid for single time bucket, single row, single metric'
    );
  });

  test('invalid due to multiple rows', function(assert) {
    const request = ValidRequest.clone();
    request.addColumn({ type: 'dimension', field: 'property', parameters: { field: 'id' }, source: 'bardOne' });
    assert.deepEqual(Manifest.typeIsValid(request), false, 'metric label is invalid due to multiple rows');
  });

  test('invalid due to multiple metrics', function(assert) {
    const request = ValidRequest.clone();
    request.addColumn({ type: 'metric', field: 'navClicks', parameters: {}, source: 'bardOne' });
    assert.deepEqual(Manifest.typeIsValid(request), false, 'metric label is invalid due to multiple metrics');
  });

  test('invalid due to multiple time buckets', function(assert) {
    const request = ValidRequest.clone();
    request.dateTimeFilter.values = ['2015-11-09 00:00:00.000', '2015-11-16 00:00:00.000'];
    assert.deepEqual(Manifest.typeIsValid(request), false, 'metric label is invalid due to multiple time buckets');
  });
});
