import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import BarChartManifest from 'navi-core/navi-visualization-manifests/bar-chart';

let ValidRequest: RequestFragment;
let Manifest: BarChartManifest;

module('Unit | Manifests | bar chart', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    const store = this.owner.lookup('service:store');

    Manifest = this.owner.lookup('navi-visualization-manifest:bar-chart');

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
      sorts: [{ type: 'metric', field: 'navClicks', parameters: {}, direction: 'asc', source: 'bardOne' }]
    });
  });

  test('invalid for single time bucket, no dimension, single metric', function(assert) {
    assert.notOk(
      Manifest.typeIsValid(ValidRequest),
      'bar chart type is invalid for single time bucket, no dimensions, single metric'
    );
  });

  test('valid for single time bucket, no dimensions, multiple metrics', function(assert) {
    const request = ValidRequest.clone();
    request.addColumn({ type: 'metric', field: 'totalPageViews', parameters: {}, source: 'bardOne' });
    assert.ok(
      Manifest.typeIsValid(request),
      'bar chart type is valid for single time bucket, no dimensions, multiple metrics'
    );
  });

  test('valid for single time bucket with dimension and a single metric', function(assert) {
    const request = ValidRequest.clone();
    request.addColumn({ type: 'dimension', field: 'age', parameters: { field: 'id' }, source: 'bardOne' });
    assert.ok(
      Manifest.typeIsValid(request),
      'bar chart type is valid for single time bucket with dimension and metric'
    );
  });

  test('invalid for single time bucket with dimension and no metrics', function(assert) {
    const request = ValidRequest.clone();
    request.columns = [
      //@ts-ignore
      { type: 'timeDimension', field: 'network.dateTime', parameters: { grain: 'day' }, source: 'bardOne' },
      //@ts-ignore
      { type: 'dimension', field: 'age', parameters: { field: 'id' }, source: 'bardOne' }
    ];
    assert.notOk(
      Manifest.typeIsValid(request),
      'bar chart type is invalid for single time bucket with dimension and no metrics'
    );
  });

  test('valid for multiple time buckets with dimension and metric', function(assert) {
    const request = ValidRequest.clone();
    request.dateTimeFilter!.values = ['2015-11-09 00:00:00.000', '2015-11-16 00:00:00.000'];
    request.addColumn({ type: 'dimension', field: 'age', parameters: { field: 'id' }, source: 'bardOne' });
    assert.ok(
      Manifest.typeIsValid(request),
      'bar chart type is valid for multiple time buckets with dimension and metric'
    );
  });

  test('valid for multiple time bucket no dimension and metric', function(assert) {
    const request = ValidRequest.clone();
    request.dateTimeFilter!.values = ['2015-11-09 00:00:00.000', '2015-11-16 00:00:00.000'];
    assert.ok(
      Manifest.typeIsValid(request),
      'bar chart type is invalid for multiple time bucket no dimension and metric'
    );
  });
});
