import DefaultIntervals from 'navi-reports/utils/enums/default-intervals';
import { module, test } from 'qunit';
import Interval from 'navi-data/utils/classes/interval';
import Duration from 'navi-data/utils/classes/duration';

module('Unit | Utils | Enums - Default Intervals', function() {
  test('getDefault', function(assert) {
    assert.expect(1);

    assert.ok(
      DefaultIntervals.getDefault('day').isEqual(new Interval(new Duration(DefaultIntervals['day']), 'current')),
      'method returns an interval between current and the default lookback for the time grain'
    );
  });
});
