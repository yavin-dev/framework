import DefaultIntervals from 'navi-reports/utils/enums/default-intervals';
import { module, test } from 'qunit';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';
import moment from 'moment';

module('Unit | Utils | Enums - Default Intervals', function() {
  test('getDefault', function(assert) {
    assert.expect(1);

    assert.ok(
      DefaultIntervals.getDefault('day').isEqual(new Interval(new Duration(DefaultIntervals['day']), 'current')),
      'method returns an interval between current and the default lookback for the time grain'
    );
  });

  test('getDefault - all time grain', function(assert) {
    assert.expect(1);

    let defaultInterval = DefaultIntervals.getDefault('all');

    assert.ok(moment.isMoment(defaultInterval._end), 'all time grain uses the current moment, rather than the macro');
  });
});
