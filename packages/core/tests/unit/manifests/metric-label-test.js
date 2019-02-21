import { A } from '@ember/array';
import { copy } from '@ember/object/internals';
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

module('Unit | Manifests | metric label', function(hooks) {
  setupTest(hooks);

  test('metric label visualization type is valid', function(assert) {
    assert.expect(4);

    // valid
    let validRequest = copy(VALID_REQUEST),
      manifest = this.owner.lookup('manifest:metric-label'),
      request = copy(validRequest);
    assert.deepEqual(
      manifest.typeIsValid(request),
      true,
      'metric label is valid for single time bucket, single row, single metric'
    );

    // multiple rows
    set(request, 'dimensions', [{ dimension: 'property' }]);
    assert.deepEqual(manifest.typeIsValid(request), false, 'metric label is invalid due to multiple rows');

    // multiple metrics
    set(request, 'metrics', [{ metric: 'adClicks' }, { metric: 'navClicks' }]);
    assert.deepEqual(manifest.typeIsValid(request), false, 'metric label is invalid due to multiple metrics');

    // multiple time buckets
    request = copy(VALID_REQUEST);
    let intervals = A([
      {
        interval: new Interval(moment('2015-11-09 00:00:00.000'), moment('2015-11-16 00:00:00.000'))
      }
    ]);
    set(request, 'intervals', intervals);
    assert.deepEqual(manifest.typeIsValid(request), false, 'metric label is invalid due to multiple time buckets');
  });
});
