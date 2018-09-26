import { moduleForComponent, test } from 'ember-qunit';
import Duration from 'navi-core/utils/classes/duration';
import Interval from 'navi-core/utils/classes/interval';

moduleForComponent('filter-builders/date-time', 'Unit | Component | filter builders/date time', {
  unit: true
});

test('filter property', function(assert) {
  assert.expect(3);

  const mockFilterFragment = {
    interval: new Interval(new Duration('P7D'), 'current')
  };

  let dateBuilder = this.subject({
    requestFragment: mockFilterFragment,
    request: {
      logicalTable: {
        timeGrain: { longName: 'Day' }
      }
    }
  });

  assert.equal(
    dateBuilder.get('filter.subject.longName'),
    'Date Time (Day)',
    'Filter subject has a display name of "Date Time" plus the time grain'
  );

  assert.deepEqual(
    dateBuilder.get('filter.operator'),
    dateBuilder.get('supportedOperators')[0],
    'Filter operator is the first and only supported operator'
  );

  assert.deepEqual(
    dateBuilder.get('filter.values'),
    [mockFilterFragment.interval],
    'Filter values is a single element array containing the interval from the request fragment'
  );
});
