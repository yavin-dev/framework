import { A } from '@ember/array';
import { copy } from 'ember-copy';
import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Interval from 'navi-core/utils/classes/interval';
import moment from 'moment';

const VALID_REQUEST = {
  logicalTable: {
    table: 'network',
    timeGrain: { name: 'day' }
  },
  metrics: [{ metric: 'adClicks' }],
  dimensions: [],
  filters: [],
  sort: [
    {
      metric: 'navClicks',
      direction: 'asc'
    }
  ],
  intervals: A([{ interval: new Interval('current', 'next') }]),
  bardVersion: 'v1',
  requestVersion: 'v1'
};

module('Unit | Manifests | bar chart', function(hooks) {
  setupTest(hooks);

  test('bar chart visualization type is valid', function(assert) {
    assert.expect(6);

    // invalid for single time bucket, no dimension, single metric
    let request = copy(VALID_REQUEST),
      manifest = this.owner.lookup('navi-visualization-manifest:bar-chart');
    assert.notOk(
      manifest.typeIsValid(request),
      'bar chart type is invalid for single time bucket, no dimensions, single metric'
    );

    // valid for single time bucket, no dimensions, multiple metrics
    set(request, 'metrics', [{ metric: 'adClicks' }, { metric: 'totalPageViews' }]);
    assert.ok(
      manifest.typeIsValid(request),
      'bar chart type is valid for single time bucket, no dimensions, multiple metrics'
    );

    // valid for single time bucket with dimension and a single metric
    set(request, 'dimensions', [{ dimension: 'sword' }]);
    set(request, 'metrics', [{ metric: 'adClicks' }]);
    assert.ok(
      manifest.typeIsValid(request),
      'bar chart type is valid for single time bucket with dimension and metric'
    );

    // invalid for single time bucket with dimension and no metrics
    set(request, 'metrics', []);
    assert.notOk(
      manifest.typeIsValid(request),
      'bar chart type is invalid for single time bucket with dimension and no metrics'
    );

    // valid for multiple time buckets with dimension and metric
    let intervals = A([
      {
        interval: new Interval(moment('2015-11-09 00:00:00.000'), moment('2015-11-16 00:00:00.000'))
      }
    ]);
    set(request, 'intervals', intervals);
    set(request, 'metrics', [{ metric: 'adClicks' }]);
    assert.ok(
      manifest.typeIsValid(request),
      'bar chart type is valid for multiple time buckets with dimension and metric'
    );

    // valid for multiple time bucket no dimension and metric
    set(request, 'dimensions', []);
    assert.ok(
      manifest.typeIsValid(request),
      'bar chart type is invalid for multiple time bucket no dimension and metric'
    );
  });
});
