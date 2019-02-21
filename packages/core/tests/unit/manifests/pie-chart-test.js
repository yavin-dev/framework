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
  dimensions: [{ dimension: 'age' }],
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

module('Unit | Manifests | pie chart', function(hooks) {
  setupTest(hooks);

  test('pie chart visualization type is valid', function(assert) {
    assert.expect(3);

    // valid for single time bucket and group by
    let request = copy(VALID_REQUEST),
      manifest = this.owner.lookup('manifest:pie-chart');
    assert.ok(manifest.typeIsValid(request), 'pie chart type is valid for single time buckets');

    // invalid for multiple time buckets
    let intervals = A([
      {
        interval: new Interval(moment('2015-11-09 00:00:00.000'), moment('2015-11-16 00:00:00.000'))
      }
    ]);
    set(request, 'intervals', intervals);
    assert.notOk(manifest.typeIsValid(request), 'pie chart type is invalid for multiple time buckets');

    // invalid for single time bucket with no group by
    intervals = A([{ interval: new Interval('current', 'next') }]);
    set(request, 'intervals', intervals);
    set(request, 'dimensions', []);
    assert.notOk(manifest.typeIsValid(request), 'pie chart type is invalid for single time bucket with no group by');
  });
});
