import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Interval from 'navi-core/utils/classes/interval';
import moment from 'moment';

module('Unit | Component | filter builders/date time', function(hooks) {
  setupTest(hooks);

  test('filter property', function(assert) {
    assert.expect(3);

    const mockFilterFragment = {
      interval: Interval.parseFromStrings('P7D', 'current')
    };

    let dateBuilder = this.owner.factoryFor('component:filter-builders/date-time').create({
      requestFragment: mockFilterFragment,
      request: {
        logicalTable: {
          timeGrain: 'day',
          table: {
            timeGrains: [
              {
                id: 'day',
                name: 'Day'
              }
            ]
          }
        }
      }
    });

    assert.equal(
      dateBuilder.get('filter.subject.name'),
      'Date Time (Day)',
      'Filter subject has a display name of "Date Time" plus the time grain'
    );

    assert.deepEqual(
      dateBuilder.get('supportedOperators').map(op => op.name),
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
      interval: Interval.parseFromStrings('P1W', 'current')
    };

    let dateBuilder = this.owner.factoryFor('component:filter-builders/date-time').create({
      requestFragment: mockFilterFragment,
      request: {
        logicalTable: {
          timeGrain: 'week',
          table: {
            timeGrains: [
              {
                id: 'week',
                name: 'Week'
              }
            ]
          }
        }
      }
    });

    assert.deepEqual(
      dateBuilder.get('supportedOperators').map(op => op.name),
      ['Current Week', 'In The Past', 'Since', 'Between', 'Advanced'],
      'Filter operator is the first and only supported operator'
    );
  });

  test('Interval operator', function(assert) {
    assert.expect(10);

    const mockFilterFragment = {
      interval: Interval.parseFromStrings('P1W', 'current')
    };

    let dateBuilder = this.owner.factoryFor('component:filter-builders/date-time').create({
      requestFragment: mockFilterFragment,
      request: {
        logicalTable: {
          timeGrain: 'week',
          table: {
            timeGrains: [
              {
                id: 'week',
                name: 'Week'
              }
            ]
          }
        }
      }
    });

    const intervalId = (start, end) => dateBuilder.operatorForInterval(Interval.parseFromStrings(start, end)).id;

    assert.deepEqual(intervalId('current', 'next'), 'current', 'Use current operator for current/next interval');

    assert.deepEqual(intervalId('P1D', 'current'), 'inPast', 'Use lookback operator for P_G/current interval');
    assert.deepEqual(intervalId('P10W', 'current'), 'inPast', 'Use lookback operator for P_G/current interval');
    assert.deepEqual(intervalId('P2M', 'current'), 'inPast', 'Use lookback operator for P_G/current interval');
    assert.deepEqual(intervalId('P3Y', 'current'), 'inPast', 'Use lookback operator for P_G/current interval');

    assert.deepEqual(intervalId('2019-01-01', '2019-01-02'), 'in', 'Use between operator for specific dates interval');

    assert.deepEqual(
      intervalId('2019-01-01', 'current'),
      'since',
      'Use since operator for specific dates ending with current interval'
    );
    assert.deepEqual(
      intervalId('2019-01-01', 'next'),
      'since',
      'Use since operator for specific dates ending with next interval'
    );

    assert.deepEqual(intervalId('P7D', 'next'), 'advanced', 'Use advanced operator for complicated combinations');
    assert.deepEqual(intervalId('P7D', '2019-01-01'), 'advanced', 'Use advanced operator for complicated combinations');
  });

  test('Switching operator', function(assert) {
    assert.expect(44);

    let dateBuilder = this.owner.factoryFor('component:filter-builders/date-time').create({
      requestFragment: { interval: Interval.parseFromStrings('P1W', 'current') },
      request: {
        logicalTable: {
          timeGrain: 'week',
          table: {
            timeGrains: [
              {
                id: 'week',
                name: 'Week'
              }
            ]
          }
        }
      }
    });

    const dateFormat = 'YYYY-MM-DD';
    const as = (start, end) => Interval.parseFromStrings(start, end);
    const translate = (interval, dateTimePeriod, newOperator) => {
      const { start, end } = dateBuilder
        .intervalForOperator(interval, dateTimePeriod, newOperator)
        .asStrings(dateFormat);
      return `${start}/${end}`;
    };

    // 'current' tests
    assert.deepEqual(
      translate(as('P7D', 'current'), 'day', 'current'),
      'current/next',
      'Switching to current day is current/next'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2019-01-02'), 'week', 'current'),
      'current/next',
      'Switching to current week is current/next'
    );
    assert.deepEqual(
      translate(as('P1M', '2019-01-01'), 'month', 'current'),
      'current/next',
      'Switching to current month is current/next'
    );
    assert.deepEqual(
      translate(as('P6M', 'current'), 'quarter', 'current'),
      'current/next',
      'Switching to current quarter is current/next'
    );
    assert.deepEqual(
      translate(as('2018-01-01', '2019-01-01'), 'year', 'current'),
      'current/next',
      'Switching to current year is current/next'
    );

    const last = (amount, dateTimePeriod) => new Interval(moment().subtract(amount, dateTimePeriod), moment());

    // 'inPast' tests
    assert.deepEqual(translate(last(4, 'day'), 'day', 'inPast'), 'P4D/current', 'Switching to inPast counts the days');
    assert.deepEqual(
      translate(last(3, 'week'), 'week', 'inPast'),
      'P3W/current',
      'Switching to inPast counts the days'
    );
    assert.deepEqual(
      translate(last(6, 'month'), 'month', 'inPast'),
      'P6M/current',
      'Switching to inPast counts the days'
    );
    assert.deepEqual(
      translate(last(9, 'month'), 'quarter', 'inPast'),
      'P9M/current',
      'Switching to inPast counts the days'
    );
    assert.deepEqual(
      translate(last(2, 'year'), 'year', 'inPast'),
      'P2Y/current',
      'Switching to inPast counts the days'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2019-01-02'), 'day', 'inPast'),
      'P1D/current',
      'inPast maps invalid interval to P1D/current for day'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2019-01-08'), 'week', 'inPast'),
      'P1W/current',
      'inPast maps invalid interval to P1W/current for day'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2019-03-03'), 'month', 'inPast'),
      'P1M/current',
      'inPast maps invalid interval to P1M/current for day'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2019-05-01'), 'quarter', 'inPast'),
      'P3M/current',
      'inPast maps invalid interval to P3M/current for day'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2020-03-02'), 'year', 'inPast'),
      'P1Y/current',
      'inPast maps invalid interval to P1Y/current for day'
    );

    const currentInterval = dateTimePeriod => {
      const { start, end } = Interval.parseFromStrings('current', 'next').asMomentsForTimePeriod(dateTimePeriod);
      return `${start.format(dateFormat)}/${end.format(dateFormat)}`;
    };
    // 'in' tests
    assert.deepEqual(
      translate(as('current', 'next'), 'day', 'in'),
      currentInterval('day'),
      'in translates current/next to days for day'
    );
    assert.deepEqual(
      translate(as('current', 'next'), 'week', 'in'),
      currentInterval('isoweek'),
      'in translates current/next to days for week'
    );
    assert.deepEqual(
      translate(as('current', 'next'), 'month', 'in'),
      currentInterval('month'),
      'in translates current/next to days for month'
    );
    assert.deepEqual(
      translate(as('current', 'next'), 'year', 'in'),
      currentInterval('year'),
      'in translates current/next to days for year'
    );
    assert.deepEqual(
      translate(as('P1D', '2019-01-01'), 'day', 'in'),
      '2018-12-31/2019-01-01',
      'in translates P1D lookback to concrete'
    );
    assert.deepEqual(
      translate(as('P1W', '2019-01-01'), 'day', 'in'),
      '2018-12-25/2019-01-01',
      'in translates P1W lookback to concrete'
    );
    assert.deepEqual(
      translate(as('P1M', '2019-01-01'), 'day', 'in'),
      '2018-12-01/2019-01-01',
      'in translates P1M lookback to concrete'
    );
    assert.deepEqual(
      translate(as('P1Y', '2019-01-01'), 'day', 'in'),
      '2018-01-01/2019-01-01',
      'in translates P1Y lookback to concrete'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2019-01-02'), 'day', 'in'),
      '2019-01-01/2019-01-02',
      'in maps invalid interval to grain for day'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2019-01-08'), 'week', 'in'),
      '2018-12-31/2019-01-07',
      'in maps invalid interval to grain for week'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2019-03-03'), 'month', 'in'),
      '2019-01-01/2019-03-01',
      'in maps invalid interval to grain for month'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2019-05-01'), 'quarter', 'in'),
      '2019-01-01/2019-04-01',
      'in maps invalid interval to grain for quarter'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2020-03-02'), 'year', 'in'),
      '2019-01-01/2020-01-01',
      'in maps invalid interval to grain for year'
    );

    // 'since' tests
    assert.deepEqual(
      translate(as('2019-01-01', '2020-01-01'), 'day', 'since'),
      '2019-01-01/current',
      'since maps invalid interval to start/current for day'
    );
    assert.deepEqual(
      translate(as('2019-01-02', '2020-01-01'), 'week', 'since'),
      '2018-12-31/current',
      'since maps invalid interval start/end to start/current for week'
    );
    assert.deepEqual(
      translate(as('2019-01-02', '2020-01-01'), 'month', 'since'),
      '2019-01-01/current',
      'since maps invalid interval to start/current for month'
    );
    assert.deepEqual(
      translate(as('2019-05-01', '2020-01-01'), 'quarter', 'since'),
      '2019-04-01/current',
      'since maps invalid interval to start/current for quarter'
    );
    assert.deepEqual(
      translate(as('2019-03-01', '2020-01-01'), 'year', 'since'),
      '2019-01-01/current',
      'since maps invalid interval to start/current for year'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2020-01-01'), 'day', 'since'),
      '2019-01-01/current',
      'since translates start/end to start/current for day'
    );
    assert.deepEqual(
      translate(as('2018-12-31', '2020-01-01'), 'week', 'since'),
      '2018-12-31/current',
      'since translates start/end to start/current for week'
    );
    assert.deepEqual(
      translate(as('2019-03-01', '2020-01-01'), 'quarter', 'since'),
      '2019-01-01/current',
      'since translates start/end to start/current for quarter'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2020-01-01'), 'year', 'since'),
      '2019-01-01/current',
      'since translates start/end to start/current for year'
    );

    // 'advanced' tests
    const today = moment().format(dateFormat);
    const tomorrow = moment()
      .add(1, 'day')
      .format(dateFormat);
    assert.deepEqual(
      translate(as('current', 'next'), 'day', 'advanced'),
      `P1D/${tomorrow}`,
      'advanced translates start/end to PxD/end for year'
    );
    assert.deepEqual(
      translate(last(4, 'day'), 'day', 'advanced'),
      `P4D/${today}`,
      'Switching to inPast counts the days'
    );
    assert.deepEqual(
      translate(as('2019-01-02', '2020-01-01'), 'day', 'advanced'),
      'P364D/2020-01-01',
      'advanced translates start/end to PxD/end for day'
    );
    assert.deepEqual(
      translate(as('2018-12-31', '2020-01-01'), 'week', 'advanced'),
      'P366D/2019-12-30',
      'advanced translates start/end to PxD/end for week'
    );
    assert.deepEqual(
      translate(as('2019-02-01', '2020-01-01'), 'month', 'advanced'),
      'P334D/2020-01-01',
      'advanced translates start/end to PxD/end for month'
    );
    assert.deepEqual(
      translate(as('2019-03-01', '2020-01-01'), 'quarter', 'advanced'),
      'P306D/2020-01-01',
      'advanced translates start/end to PxD/end for quarter'
    );
    assert.deepEqual(
      translate(as('2019-01-01', '2020-01-01'), 'year', 'advanced'),
      'P365D/2020-01-01',
      'advanced translates start/end to PxD/end for year'
    );
  });
});
