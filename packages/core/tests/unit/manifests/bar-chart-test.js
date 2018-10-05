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

moduleFor('manifest:bar-chart', 'Unit | Manifests | bar chart');

test('bar chart visualization type is valid', function(assert) {
  assert.expect(4);

  // invalid for single time bucket no dimension
  let request = copy(VALID_REQUEST),
    manifest = this.subject();
  assert.notOk(manifest.typeIsValid(request), 'bar chart type is invalid for single time bucket no dimension');

  // valid for single time bucket with dimension
  set(request, 'dimensions', ['sword']);
  assert.ok(manifest.typeIsValid(request), 'bar chart type is valid for single time bucket with dimension');

  // valid for multiple time buckets with dimension
  let intervals = Ember.A([
    {
      interval: new Interval(moment('2015-11-09 00:00:00.000'), moment('2015-11-16 00:00:00.000'))
    }
  ]);
  set(request, 'intervals', intervals);
  assert.ok(manifest.typeIsValid(request), 'bar chart type is valid for multiple time buckets with dimension');

  // valid for multiple time bucket no dimension
  set(request, 'dimensions', []);
  assert.ok(manifest.typeIsValid(request), 'bar chart type is invalid for multiple time bucket no dimension');
});
