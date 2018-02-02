import Duration from 'navi-core/utils/classes/duration';
import { parseDuration, isIsoDurationString } from 'navi-core/utils/classes/duration';
import { module, test } from 'qunit';

const ALL = Duration.ALL;

module('Unit | Utils | Duration Class');

test('Construction of duration objects', function(assert) {
  assert.expect(14);

  assert.throws(function () {
    buildDuration();
  }, 'error is thrown while constructing a duration object with an undefined ISO duration');

  assert.throws(function () {
    buildDuration('invalid');
  }, 'error is thrown while constructing a duration object with an invalid ISO duration');

  assert.throws(function () {
    buildDuration('P0W');
  }, 'error is thrown while constructing a duration object with zero ISO duration');

  assert.throws(function () {
    buildDuration('PT1J');
  }, 'error is thrown while constructing a duration object with an invalid ISO duration');

  let duration = buildDuration('PT1H');
  assert.equal(duration.getValue(), 1, 'duration object has value as 1');
  assert.equal(duration.getUnit(), 'hour', 'duration object has unit as hour');

  duration = buildDuration('P7D');
  assert.equal(duration.getValue(), 7, 'duration object has value as 7');
  assert.equal(duration.getUnit(), 'day', 'duration object has unit as day');

  duration = buildDuration('P52W');
  assert.equal(duration.getValue(), 52, 'duration object has value as 52');
  assert.equal(duration.getUnit(), 'week', 'duration object has unit as week');

  duration = buildDuration('P6M');
  assert.equal(duration.getValue(), 6, 'duration object has value as 6');
  assert.equal(duration.getUnit(), 'month', 'duration object has unit as month');

  duration = buildDuration(ALL);
  assert.equal(duration.getValue(), ALL, 'duration object has value as '+ ALL);
  assert.equal(duration.getUnit(), undefined, 'duration object has unit as undefined');
});

test('humanize', function(assert) {
  assert.expect(4);

  let duration = buildDuration('PT1M');
  assert.equal(duration.humanize(), '1 Minute', 'humanize returns "1 Hour" for duration PT1H');

  duration = buildDuration('P1W');
  assert.equal(duration.humanize(), '1 Week', 'humanize returns "1 Week" for duration P1W');

  duration = buildDuration('P52W');
  assert.equal(duration.humanize(), '52 Weeks', 'humanize returns "52 Weeks" for duration P52W');

  duration = buildDuration(ALL);
  assert.equal(duration.humanize(), 'All', 'humanize returns "All" for all duration');
});

test('toString', function(assert) {
  assert.expect(2);

  let duration = buildDuration('P8M');
  assert.equal(duration.toString(), 'P8M', 'toString returns "P8W" for duration P8M');

  duration = buildDuration(ALL);
  assert.equal(duration.toString(), ALL, 'toString returns ' + ALL + ' for all duration');
});

test('compare', function(assert) {
  assert.expect(7);

  let duration = buildDuration('P7D');
  assert.equal(duration.compare('P7D'), 0, 'compare returns 0 when we compare P7D to P7D');

  assert.equal(duration.compare('P1D'), 1, 'compare returns -1 when we compare P7D to P1D');

  assert.equal(duration.compare('P12D'), -1, 'compare returns -1 when we compare P7D to P12D');

  assert.equal(duration.compare(ALL), -1, 'compare returns -1 when we compare all duration to P7D');

  assert.throws(function () {
    duration.compare('P1W');
  }, 'compare throws error while comparing durations having different units');

  assert.throws(function () {
    duration.isEqual('invalid');
  }, 'compare throws error while comparing P7D to an invalid duration');

  duration = buildDuration(ALL);
  assert.equal(duration.compare(ALL), 0, 'compare returns 0 when we compare all duration to all duration');
});

test('isEqual', function(assert) {
  assert.expect(4);

  let duration = buildDuration('P12W');

  assert.throws(function () {
    duration.isEqual('invalid');
  }, 'isEqual throws an error for invalid ISO duration argument');

  assert.equal(duration.isEqual('P12W'), true, 'isEqual returns true when duration of 12 weeks is equal to P12W');

  assert.equal(duration.isEqual('P15D'), false, 'isEqual returns false when duration of 12 weeks is not equal to P15D');

  duration = buildDuration(ALL);
  assert.equal(duration.isEqual(ALL), true, 'isEqual returns true when both durations are all duration');
});

test('isAll', function(assert) {
  assert.expect(4);

  let duration = buildDuration('P12W');
  assert.equal(Duration.isAll(duration), false, 'isAll returns false for duration P12W');

  duration = buildDuration(ALL);
  assert.equal(Duration.isAll(duration), true, 'isAll returns true for all duration');

  duration = Duration.all();
  assert.equal(Duration.isAll(duration), true, 'isAll returns true for all duration instance obtained from all static method');

  assert.equal(Duration.isAll(), false, 'isAll returns false for null duration');
});

test('getAllString static method', function(assert) {
  assert.expect(1);

  assert.equal(Duration.ALL, '__ALL__', 'ALL static property has value __ALL__');
});

test('all static method', function(assert) {
  assert.expect(2);

  let duration = Duration.all();
  assert.equal(duration.getValue(), ALL, 'all static method returns all duration instance with value as ' + ALL);
  assert.equal(duration.getUnit(), undefined, 'all static method returns all duration instance with unit as undefined');
});

test('isDuration static method', function(assert) {
  assert.expect(6);

  assert.equal(Duration.isDuration(ALL), false, 'isDuration static method returns false for string ' + ALL);
  assert.equal(Duration.isDuration('P6D'), false, 'isDuration static method returns false for string P6D');
  assert.equal(Duration.isDuration(), false, 'isDuration static method returns false for undefined argument');
  assert.equal(Duration.isDuration(null), false, 'isDuration static method returns false for null argument');

  let duration = Duration.all();
  assert.equal(Duration.isDuration(duration), true, 'isDuration static method returns false for all duration');

  duration = new Duration('P3W');
  assert.equal(Duration.isDuration(duration), true, 'isDuration static method returns false for duration of P3W');
});

test('parseDuration', function(assert) {
  assert.expect(18);

  /* == Invalid Cases == */
  assert.equal(parseDuration(),
    null,
    'parseDuration returns null while parsing an undefined ISO duration');

  assert.equal(parseDuration('invalid'),
    null,
    'parseDuration returns null while parsing an invalid ISO duration');

  assert.equal(parseDuration('P0W'),
    null,
    'parseDuration returns null while parsing a zero ISO duration');

  assert.equal(parseDuration('D1W'),
    null,
    'parseDuration returns null while parsing a ISO duration with an invalid period designator');

  /* == Valid Cases == */
  let [value, unit] = parseDuration('PT1S');
  assert.equal(value, 1, 'parseDuration parses PT1S and returns 1 as the value');
  assert.equal(unit, 'second', 'parseDuration parses PT1S and returns second as the unit');

  [value, unit] = parseDuration('PT1M');
  assert.equal(value, 1, 'parseDuration parses PT1M and returns 1 as the value');
  assert.equal(unit, 'minute', 'parseDuration parses PT1M and returns minute as the unit');

  [value, unit] = parseDuration('PT1H');
  assert.equal(value, 1, 'parseDuration parses PT1H and returns 1 as the value');
  assert.equal(unit, 'hour', 'parseDuration parses PT1H and returns hour as the unit');

  [value, unit] = parseDuration('P7D');
  assert.equal(value, 7, 'parseDuration parses P7D and returns 7 as the value');
  assert.equal(unit, 'day', 'parseDuration parses P7D and returns day as the unit');

  [value, unit] = parseDuration('P12W');
  assert.equal(value, 12, 'parseDuration parses P12W and returns 12 as the value');
  assert.equal(unit, 'week', 'parseDuration parses P12W and returns week as the unit');

  [value, unit] = parseDuration('P10M');
  assert.equal(value, 10, 'parseDuration parses P10M and returns 10 as the value');
  assert.equal(unit, 'month', 'parseDuration parses P10M and returns month as the unit');

  [value, unit] = parseDuration(ALL);
  assert.equal(value, ALL, 'parseDuration parses ' + ALL + ' and returns ' + ALL + ' as the value');
  assert.equal(unit, undefined, 'parseDuration parses ' + ALL + ' and returns undefined as the unit');
});

test('isIsoDurationString', function(assert) {
  assert.expect(5);

  assert.notOk(isIsoDurationString(), 'Undefined is not a valid ISO duration');
  assert.notOk(isIsoDurationString('P0W'), 'Zero value is not a valid ISO duration');
  assert.notOk(isIsoDurationString('P1J'), 'Unsupported time unit is not a valid ISO duration');
  assert.ok(isIsoDurationString('PT1H'), 'PT1H is a valid ISO duration');
  assert.ok(isIsoDurationString('P7D'), 'P7D is a valid ISO duration');
});

function buildDuration(isoDuration) {
  return new Duration(isoDuration);
}
