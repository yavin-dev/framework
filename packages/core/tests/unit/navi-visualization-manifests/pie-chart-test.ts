import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import PieChartManifest from 'navi-core/navi-visualization-manifests/pie-chart';
import StoreService from '@ember-data/store';

let ValidRequest: RequestFragment;
let Manifest: PieChartManifest;
let Store: StoreService;

module('Unit | Manifests | pie chart', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    Store = this.owner.lookup('service:store');

    Manifest = this.owner.lookup('navi-visualization-manifest:pie-chart');

    ValidRequest = Store.createFragment('bard-request-v2/request', {
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
        { type: 'dimension', field: 'age', parameters: { field: 'id' }, source: 'bardOne' },
        { type: 'metric', field: 'adClicks', parameters: {}, source: 'bardOne' }
      ],
      sorts: [{ type: 'metric', field: 'adClicks', parameters: {}, direction: 'asc', source: 'bardOne' }]
    });
  });

  test('valid for single time bucket and group by', function(assert) {
    assert.ok(
      Manifest.typeIsValid(ValidRequest),
      'pie chart type is valid for single time bucket with dimension and metric'
    );
  });

  test('invalid for multiple time buckets', function(assert) {
    const request = ValidRequest.clone();
    request.filters = [
      //@ts-ignore
      {
        type: 'timeDimension',
        field: 'network.dateTime',
        parameters: { grain: 'day' },
        operator: 'bet',
        values: ['2015-11-09 00:00:00.000', '2015-11-16 00:00:00.000'],
        source: 'bardOne'
      }
    ];
    assert.notOk(Manifest.typeIsValid(request), 'pie chart type is invalid for multiple time buckets');
  });

  test('invalid for single time bucket with no group by', function(assert) {
    const request = ValidRequest.clone();
    //@ts-ignore
    request.columns = request.columns.filter(({ type }) => type !== 'dimension');
    assert.notOk(Manifest.typeIsValid(request), 'pie chart type is invalid for single time bucket with no group by');
  });

  test('valid for single time bucket with no group by and multiple metrics', function(assert) {
    const request = ValidRequest.clone();
    request.columns = [
      //@ts-ignore
      { type: 'timeDimension', field: 'network.dateTime', parameters: { grain: 'day' }, source: 'bardOne' },
      //@ts-ignore
      { type: 'metric', field: 'adClicks', parameters: {}, source: 'bardOne' },
      //@ts-ignore
      { type: 'metric', field: 'totalPageViews', parameters: {}, source: 'bardOne' }
    ];
    assert.ok(
      Manifest.typeIsValid(request),
      'pie chart type is valid for single time bucket with no group by and multiple metrics'
    );
  });

  test('invalid for single time bucket with no metrics', function(assert) {
    const request = Store.createFragment('bard-request-v2/request', {
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
        { type: 'dimension', field: 'age', parameters: { field: 'id' }, source: 'bardOne' }
      ],
      sorts: []
    });
    assert.notOk(Manifest.typeIsValid(request), 'pie chart type is invalid for single time bucket with no metrics');
  });
});
