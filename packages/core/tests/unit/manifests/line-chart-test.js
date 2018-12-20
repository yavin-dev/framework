import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import Interval from 'navi-core/utils/classes/interval';
import moment from 'moment';

const { copy, set } = Ember,
  VALID_REQUEST = {
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
    intervals: Ember.A([{ interval: new Interval('current', 'next') }]),
    bardVersion: 'v1',
    requestVersion: 'v1'
  };

moduleFor('manifest:line-chart', 'Unit | Manifests | line chart');

test('line chart visualization type is valid', function(assert) {
  assert.expect(2);

  // invalid for single time bucket
  let request = copy(VALID_REQUEST),
    manifest = this.subject();
  assert.notOk(manifest.typeIsValid(request), 'line chart type is invalid for single time bucket');

  // valid for multiple time buckets
  let intervals = Ember.A([
    {
      interval: new Interval(moment('2015-11-09 00:00:00.000'), moment('2015-11-16 00:00:00.000'))
    }
  ]);
  set(request, 'intervals', intervals);
  assert.ok(manifest.typeIsValid(request), 'line chart type is valid for multiple time buckets');
});
