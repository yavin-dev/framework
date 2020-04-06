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
    timeGrain: 'day'
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

module('Unit | Manifests | goal gauge', function(hooks) {
  setupTest(hooks);

  test('goal gauge visualization type is valid', function(assert) {
    assert.expect(4);

    // valid
    let validRequest = copy(VALID_REQUEST),
      manifest = this.owner.lookup('navi-visualization-manifest:goal-gauge'),
      request = copy(validRequest);
    assert.ok(manifest.typeIsValid(request), 'goal gauge is valid for single time bucket, single row, single metric');

    // multiple rows
    set(request, 'dimensions', [{ dimension: 'property' }]);
    assert.notOk(manifest.typeIsValid(request), 'goal gauge is invalid due to multiple rows');

    // multiple metrics
    set(request, 'metrics', [{ metric: 'adClicks' }, { metric: 'navClicks' }]);
    assert.notOk(manifest.typeIsValid(request), 'goal gauge is invalid due to multiple metrics');

    // multiple time buckets
    request = copy(VALID_REQUEST);
    let intervals = A([
      {
        interval: new Interval(moment('2015-11-09 00:00:00.000'), moment('2015-11-16 00:00:00.000'))
      }
    ]);
    set(request, 'intervals', intervals);
    assert.notOk(manifest.typeIsValid(request), 'goal gauge is invalid due to multiple time buckets');
  });
});
