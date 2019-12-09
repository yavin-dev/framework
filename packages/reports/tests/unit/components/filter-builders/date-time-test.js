import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Duration from 'navi-core/utils/classes/duration';
import Interval from 'navi-core/utils/classes/interval';

module('Unit | Component | filter builders/date time', function(hooks) {
  setupTest(hooks);

  test('filter property', function(assert) {
    assert.expect(3);

    const mockFilterFragment = {
      interval: new Interval(new Duration('P7D'), 'current')
    };

    let dateBuilder = this.owner.factoryFor('component:filter-builders/date-time').create({
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
      dateBuilder.get('supportedOperators').map(op => op.longName),
      ['Current Day', 'In The Past', 'Since', 'Between', 'Advanced'],
      'Filter operator is the first and only supported operator'
    );

    assert.deepEqual(
      dateBuilder.get('filter.values'),
      [mockFilterFragment.interval],
      'Filter values is a single element array containing the interval from the request fragment'
    );
  });

  test('supported operators', function(assert) {
    assert.expect(1);

    const mockFilterFragment = {
      interval: new Interval(new Duration('P1W'), 'current')
    };

    let dateBuilder = this.owner.factoryFor('component:filter-builders/date-time').create({
      requestFragment: mockFilterFragment,
      request: {
        logicalTable: {
          timeGrain: { longName: 'Week' }
        }
      }
    });

    assert.deepEqual(
      dateBuilder.get('supportedOperators').map(op => op.longName),
      ['Current Week', 'In The Past', 'Since', 'Between', 'Advanced'],
      'Filter operator is the first and only supported operator'
    );
  });

  test('Interval operator', function(assert) {
    assert.expect(6);

    const mockFilterFragment = {
      interval: new Interval(new Duration('P1W'), 'current')
    };

    let dateBuilder = this.owner.factoryFor('component:filter-builders/date-time').create({
      requestFragment: mockFilterFragment,
      request: {
        logicalTable: {
          timeGrain: { longName: 'Week' }
        }
      }
    });

    assert.deepEqual(
      dateBuilder.intervalOperator(Interval.parseFromStrings('current', 'next')).id,
      'current',
      'Use current operator for current/next interval'
    );

    assert.deepEqual(
      dateBuilder.intervalOperator(Interval.parseFromStrings('P1D', 'current')).id,
      'inPast',
      'Use lookback operator for P_G/current interval'
    );

    assert.deepEqual(
      dateBuilder.intervalOperator(Interval.parseFromStrings('2019-01-01', '2019-01-02')).id,
      'in',
      'Use between operator for specific dates interval'
    );

    assert.deepEqual(
      dateBuilder.intervalOperator(Interval.parseFromStrings('2019-01-01', 'current')).id,
      'since',
      'Use since operator for specific dates ending with current interval'
    );

    assert.deepEqual(
      dateBuilder.intervalOperator(Interval.parseFromStrings('2019-01-01', 'next')).id,
      'since',
      'Use since operator for specific dates ending with next interval'
    );

    assert.deepEqual(
      dateBuilder.intervalOperator(Interval.parseFromStrings('P7D', 'next')).id,
      'advanced',
      'Use advanced operator for complicated combinations'
    );
  });
});
