import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Interval from 'navi-data/utils/classes/interval';
import { set } from '@ember/object';
//@ts-ignore
import { createGlimmerComponent } from 'navi-core/test-support';
import TimeDimensionFilterBuilder, { valuesForOperator } from 'navi-reports/components/filter-builders/time-dimension';
import StoreService from '@ember-data/store';
import { TestContext } from 'ember-test-helpers';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { Grain } from 'navi-data/utils/date';

let Request: RequestFragment;
module('Unit | Component | filter-builders/time-dimension', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;
    Request = store.createFragment('bard-request-v2/request', {
      table: 'network',
      columns: [],
      filters: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: {
            grain: 'day',
          },
          operator: 'bet',
          values: ['P7D', 'current'],
          source: 'bardOne',
        },
      ],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
    });
  });

  test('filter property', function (assert) {
    const filter = Request.filters.objectAt(0) as TimeDimensionFilterBuilder['args']['filter'];
    const args: TimeDimensionFilterBuilder['args'] = {
      request: Request,
      isRequired: false,
      filter,
      onUpdateFilter: () => undefined,
    };

    let dateBuilder = createGlimmerComponent(
      'component:filter-builders/time-dimension',
      args
    ) as TimeDimensionFilterBuilder;

    assert.deepEqual(
      dateBuilder.valueBuilders.map((op) => op.name),
      ['Current Day', 'In The Past', 'Since', 'Before', 'Between'],
      'Filter operator is the first and only supported operator'
    );

    filter.updateParameters({ grain: 'isoWeek' });

    assert.deepEqual(
      dateBuilder.valueBuilders.map((op) => op.name),
      ['Current IsoWeek', 'In The Past', 'Since', 'Before', 'Between'],
      'Filter operator is the first and only supported operator'
    );
  });

  test('Interval operator', function (assert) {
    const filter = Request.filters.objectAt(0) as TimeDimensionFilterBuilder['args']['filter'];
    filter.values = ['P1W', 'current'];
    filter.updateParameters({ grain: 'isoWeek' });
    const args: TimeDimensionFilterBuilder['args'] = {
      request: Request,
      isRequired: false,
      filter,
      onUpdateFilter: () => undefined,
    };

    let dateBuilder = createGlimmerComponent(
      'component:filter-builders/time-dimension',
      args
    ) as TimeDimensionFilterBuilder;

    const intervalId = (start: string, end: string) => {
      const { values } = dateBuilder.args.filter;
      set(dateBuilder.args.filter, 'values', [start, end]);
      const { internalId } = dateBuilder.selectedValueBuilder;
      set(dateBuilder.args.filter, 'values', values);
      return internalId;
    };

    assert.deepEqual(intervalId('current', 'next'), 'current', 'Use current operator for current/next interval');

    assert.deepEqual(intervalId('P1D', 'current'), 'inPast', 'Use lookback operator for P1D/current interval');
    assert.deepEqual(intervalId('P10W', 'current'), 'inPast', 'Use lookback operator for P10W/current interval');
    assert.deepEqual(intervalId('P2M', 'current'), 'inPast', 'Use lookback operator for P2M/current interval');
    assert.deepEqual(intervalId('P3Y', 'current'), 'inPast', 'Use lookback operator for P3Y/current interval');

    assert.deepEqual(intervalId('2019-01-01', '2019-01-02'), 'in', 'Use between operator for specific dates interval');

    assert.deepEqual(
      intervalId('2019-01-01', 'current'),
      'since',
      'Use since operator for specific dates ending with current interval'
    );
    assert.deepEqual(intervalId('2019-01-01', 'next'), 'in', 'Use in operator to handle advanced "next" case');

    assert.deepEqual(intervalId('P7D', 'next'), 'in', 'Use in operator to handle advanced "next" case');
    assert.deepEqual(
      intervalId('P7D', '2019-01-01'),
      'in',
      'Use in operator to handle advanced lookback from date case'
    );
  });

  test('Switching operator', function (assert) {
    const filter = Request.filters.objectAt(0) as TimeDimensionFilterBuilder['args']['filter'];
    filter.updateParameters({ grain: 'isoWeek' });

    // 'current' tests
    filter.values = ['P1W', 'current'];
    filter.parameters.grain = 'day';
    assert.deepEqual(
      valuesForOperator(filter, 'day', 'current'),
      ['current', 'next'],
      'Switching to current day is current/next'
    );

    filter.values = ['2019-01-01', '2019-01-02'];
    filter.parameters.grain = 'isoWeek';
    assert.deepEqual(
      valuesForOperator(filter, 'isoWeek', 'current'),
      ['current', 'next'],
      'Switching to current isoWeek is current/next'
    );

    filter.values = ['P1M', '2019-01-01'];
    filter.parameters.grain = 'month';
    assert.deepEqual(
      valuesForOperator(filter, 'month', 'current'),
      ['current', 'next'],
      'Switching to current month is current/next'
    );

    filter.values = ['P6M', 'current'];
    filter.parameters.grain = 'quarter';
    assert.deepEqual(
      valuesForOperator(filter, 'quarter', 'current'),
      ['current', 'next'],
      'Switching to current quarter is current/next'
    );

    filter.values = ['2018-01-01', '2019-01-01'];
    filter.parameters.grain = 'year';
    assert.deepEqual(
      valuesForOperator(filter, 'year', 'current'),
      ['current', 'next'],
      'Switching to current year is current/next'
    );

    const intervalFor = (amount: string, grain: Grain): [string, string] => {
      const { start, end } = Interval.parseFromStrings(amount, 'current').asMomentsInclusive(grain);
      // subtract 1 to store filter values as inclusive
      return [start.toISOString(), end.toISOString()];
    };
    // 'inPast' tests
    filter.values = intervalFor('P4D', 'day');
    filter.parameters.grain = 'day';
    assert.deepEqual(
      valuesForOperator(filter, 'day', 'inPast'),
      ['P4D', 'current'],
      'Switching to inPast counts the days'
    );

    filter.values = intervalFor('P3W', 'isoWeek');
    filter.parameters.grain = 'isoWeek';
    assert.deepEqual(
      valuesForOperator(filter, 'isoWeek', 'inPast'),
      ['P3W', 'current'],
      'Switching to inPast counts the isoWeek'
    );

    filter.values = intervalFor('P6M', 'month');
    filter.parameters.grain = 'month';
    assert.deepEqual(
      valuesForOperator(filter, 'month', 'inPast'),
      ['P6M', 'current'],
      'Switching to inPast counts the months'
    );

    filter.values = intervalFor('P9M', 'quarter');
    filter.parameters.grain = 'quarter';
    assert.deepEqual(
      valuesForOperator(filter, 'quarter', 'inPast'),
      ['P9M', 'current'],
      'Switching to inPast counts the quarters'
    );

    filter.values = intervalFor('P2Y', 'year');
    filter.parameters.grain = 'year';
    assert.deepEqual(
      valuesForOperator(filter, 'year', 'inPast'),
      ['P2Y', 'current'],
      'Switching to inPast counts the years'
    );

    filter.values = ['2019-01-01', '2019-01-02'];
    filter.parameters.grain = 'day';
    assert.deepEqual(
      valuesForOperator(filter, 'day', 'inPast'),
      ['P1D', 'current'],
      'inPast maps invalid interval to P1D/current for day'
    );

    filter.values = ['2019-01-01', '2019-01-08'];
    filter.parameters.grain = 'isoWeek';
    assert.deepEqual(
      valuesForOperator(filter, 'isoWeek', 'inPast'),
      ['P1W', 'current'],
      'inPast maps invalid interval to P1W/current for day'
    );

    filter.values = ['2019-01-01', '2019-03-03'];
    filter.parameters.grain = 'month';
    assert.deepEqual(
      valuesForOperator(filter, 'month', 'inPast'),
      ['P1M', 'current'],
      'inPast maps invalid interval to P1M/current for day'
    );

    filter.values = ['2019-01-01', '2019-05-01'];
    filter.parameters.grain = 'quarter';
    assert.deepEqual(
      valuesForOperator(filter, 'quarter', 'inPast'),
      ['P3M', 'current'],
      'inPast maps invalid interval to P3M/current for day'
    );

    filter.values = ['2019-01-01', '2019-03-02'];
    filter.parameters.grain = 'year';
    assert.deepEqual(
      valuesForOperator(filter, 'year', 'inPast'),
      ['P1Y', 'current'],
      'inPast maps invalid interval to P1Y/current for day'
    );

    const currentInterval = (dateTimePeriod: Grain) => {
      const { start, end } = Interval.parseFromStrings('current', 'next').asMomentsInclusive(dateTimePeriod);
      return [start.toISOString(), end.toISOString()];
    };
    // 'in' tests

    filter.values = ['current', 'next'];
    filter.parameters.grain = 'day';
    assert.deepEqual(
      valuesForOperator(filter, 'day', 'in'),
      currentInterval('day'),
      'in translates current/next to days for day'
    );

    filter.values = ['current', 'next'];
    filter.parameters.grain = 'isoWeek';
    assert.deepEqual(
      valuesForOperator(filter, 'isoWeek', 'in'),
      currentInterval('isoWeek'),
      'in translates current/next to days for isoWeek'
    );

    filter.values = ['current', 'next'];
    filter.parameters.grain = 'month';
    assert.deepEqual(
      valuesForOperator(filter, 'month', 'in'),
      currentInterval('month'),
      'in translates current/next to days for month'
    );

    filter.values = ['current', 'next'];
    filter.parameters.grain = 'year';
    assert.deepEqual(
      valuesForOperator(filter, 'year', 'in'),
      currentInterval('year'),
      'in translates current/next to days for year'
    );

    filter.values = ['P1D', '2019-01-01'];
    filter.parameters.grain = 'day';
    assert.deepEqual(
      valuesForOperator(filter, 'day', 'in'),
      ['2019-01-01T00:00:00.000Z', '2019-01-01T00:00:00.000Z'],
      'in translates P1D lookback to concrete'
    );

    debugger;
    filter.values = ['P1W', '2018-12-31'];
    filter.parameters.grain = 'isoWeek';
    assert.deepEqual(
      valuesForOperator(filter, 'day', 'in'),
      ['2018-12-31T00:00:00.000Z', '2019-01-06T00:00:00.000Z'],
      'in translates P1W lookback to concrete'
    );

    filter.values = ['P1M', '2019-01-01'];
    filter.parameters.grain = 'month';
    assert.deepEqual(
      valuesForOperator(filter, 'day', 'in'),
      ['2019-01-01T00:00:00.000Z', '2019-01-31T00:00:00.000Z'],
      'in translates P1M lookback to concrete'
    );

    filter.values = ['P1Y', '2019-01-01'];
    filter.parameters.grain = 'year';
    assert.deepEqual(
      valuesForOperator(filter, 'day', 'in'),
      ['2019-01-01T00:00:00.000Z', '2019-12-31T00:00:00.000Z'],
      'in translates P1Y lookback to concrete'
    );

    filter.values = ['2019-01-01', '2019-01-02'];
    filter.parameters.grain = 'day';
    assert.deepEqual(
      valuesForOperator(filter, 'day', 'in'),
      ['2019-01-01T00:00:00.000Z', '2019-01-02T00:00:00.000Z'],
      'in maps invalid interval to grain for day'
    );

    filter.values = ['2019-01-01', '2019-01-08'];
    filter.parameters.grain = 'isoWeek';
    assert.deepEqual(
      valuesForOperator(filter, 'isoWeek', 'in'),
      ['2018-12-31T00:00:00.000Z', '2019-01-07T00:00:00.000Z'],
      'in maps invalid interval to grain for isoWeek'
    );

    filter.values = ['2019-01-01', '2019-03-03'];
    filter.parameters.grain = 'month';
    assert.deepEqual(
      valuesForOperator(filter, 'month', 'in'),
      ['2019-01-01T00:00:00.000Z', '2019-03-01T00:00:00.000Z'],
      'in maps invalid interval to grain for month'
    );

    filter.values = ['2019-01-01', '2019-05-01'];
    filter.parameters.grain = 'quarter';
    assert.deepEqual(
      valuesForOperator(filter, 'quarter', 'in'),
      ['2019-01-01T00:00:00.000Z', '2019-04-01T00:00:00.000Z'],
      'in maps invalid interval to grain for quarter'
    );

    filter.values = ['2019-01-01', '2020-03-02'];
    filter.parameters.grain = 'year';
    assert.deepEqual(
      valuesForOperator(filter, 'year', 'in'),
      ['2019-01-01T00:00:00.000Z', '2020-01-01T00:00:00.000Z'],
      'in maps invalid interval to grain for year'
    );

    // 'since' tests

    filter.values = ['2019-01-01', '2020-01-01'];
    filter.parameters.grain = 'day';
    assert.deepEqual(
      valuesForOperator(filter, 'day', 'since'),
      ['2019-01-01T00:00:00.000Z'],
      'since maps invalid interval to start/current for day'
    );

    filter.values = ['2019-01-02', '2020-01-01'];
    filter.parameters.grain = 'isoWeek';
    assert.deepEqual(
      valuesForOperator(filter, 'isoWeek', 'since'),
      ['2018-12-31T00:00:00.000Z'],
      'since maps invalid interval start/end to start/current for isoWeek'
    );

    filter.values = ['2019-01-02', '2020-01-01'];
    filter.parameters.grain = 'month';
    assert.deepEqual(
      valuesForOperator(filter, 'month', 'since'),
      ['2019-01-01T00:00:00.000Z'],
      'since maps invalid interval to start/current for month'
    );

    filter.values = ['2019-05-01', '2020-01-01'];
    filter.parameters.grain = 'quarter';
    assert.deepEqual(
      valuesForOperator(filter, 'quarter', 'since'),
      ['2019-04-01T00:00:00.000Z'],
      'since maps invalid interval to start/current for quarter'
    );

    filter.values = ['2019-03-01', '2020-01-01'];
    filter.parameters.grain = 'year';
    assert.deepEqual(
      valuesForOperator(filter, 'year', 'since'),
      ['2019-01-01T00:00:00.000Z'],
      'since maps invalid interval to start/current for year'
    );

    filter.values = ['2019-01-01', '2020-01-01'];
    filter.parameters.grain = 'day';
    assert.deepEqual(
      valuesForOperator(filter, 'day', 'since'),
      ['2019-01-01T00:00:00.000Z'],
      'since translates start/end to start/current for day'
    );

    filter.values = ['2018-12-31', '2020-01-01'];
    filter.parameters.grain = 'isoWeek';
    assert.deepEqual(
      valuesForOperator(filter, 'isoWeek', 'since'),
      ['2018-12-31T00:00:00.000Z'],
      'since translates start/end to start/current for isoWeek'
    );

    filter.values = ['2019-03-01', '2020-01-01'];
    filter.parameters.grain = 'quarter';
    assert.deepEqual(
      valuesForOperator(filter, 'quarter', 'since'),
      ['2019-01-01T00:00:00.000Z'],
      'since translates start/end to start/current for quarter'
    );

    filter.values = ['2019-01-01', '2020-01-01'];
    filter.parameters.grain = 'year';
    assert.deepEqual(
      valuesForOperator(filter, 'year', 'since'),
      ['2019-01-01T00:00:00.000Z'],
      'since translates start/end to start/current for year'
    );

    /*
     * These 'advanced' tests have been disabled until advanced is brought back
     *
     * const today = moment().format(dateFormat);
     * const tomorrow = moment()
     *   .add(1, 'day')
     *   .format(dateFormat);
     * assert.deepEqual(
     *   valuesForOperator(['current', 'next'], 'day', 'advanced'),
     *   [],
     *   'advanced translates start/end to PxD/end for year'
     * );
     * assert.deepEqual(
     *   valuesForOperator(last(4, 'day'), 'day', 'advanced'),
     *   `P4D/${today}`,
     *   'Switching to inPast counts the days'
     * );
     * assert.deepEqual(
     *   valuesForOperator(['2019-01-02', '2020-01-01'], 'day', 'advanced'),
     *   ['P364D', '2020-01-01'],
     *   'advanced translates start/end to PxD/end for day'
     * );
     * assert.deepEqual(
     *   valuesForOperator(['2018-12-31', '2020-01-01'], 'isoWeek', 'advanced'),
     *   ['P366D', '2019-12-30'],
     *   'advanced translates start/end to PxD/end for isoWeek'
     * );
     * assert.deepEqual(
     *   valuesForOperator(['2019-02-01', '2020-01-01'], 'month', 'advanced'),
     *   ['P334D', '2020-01-01'],
     *   'advanced translates start/end to PxD/end for month'
     * );
     * assert.deepEqual(
     *   valuesForOperator(['2019-03-01', '2020-01-01'], 'quarter', 'advanced'),
     *   ['P306D', '2020-01-01'],
     *   'advanced translates start/end to PxD/end for quarter'
     * );
     * assert.deepEqual(
     *   valuesForOperator(['2019-01-01', '2020-01-01'], 'year', 'advanced'),
     *   ['P365D', '2020-01-01'],
     *   'advanced translates start/end to PxD/end for year'
     * );
     */
  });
});
