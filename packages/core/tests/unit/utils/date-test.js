import * as DateUtils from 'navi-core/utils/date';
import { module, test } from 'qunit';
import moment from 'moment';
import config from 'ember-get-config';
import Interval from 'navi-core/utils/classes/interval';

module('Unit | Utils | DateUtils', {
  unit: true
});

test('getDatesForInterval', function(assert) {
  assert.expect(2);

  let testInterval = new Interval(
      moment('4-9-2017', 'D-M-Y'),
      moment('25-9-2017', 'D-M-Y')
    ),
    dates = DateUtils.getDatesForInterval(testInterval, 'week');

  assert.deepEqual(
    dates.map(date => date.format('D-M-Y')),
    ['4-9-2017', '11-9-2017', '18-9-2017'],
    'A moment for each week between Sep 4 and Sep 25 (exclusive) is returned'
  );

  dates = DateUtils.getDatesForInterval(testInterval, 'all');
  assert.deepEqual(
    dates.map(date => date.format('D-M-Y')),
    ['4-9-2017'],
    'A moment for all time is returned as the start date'
  );
});

test('getFirstDayOfPrevIsoDateTimePeriod - date format provided', function(assert) {
  assert.expect(4);

  var dateFormat = 'MM-DD-YYYY';

  var expectedDate1 = moment()
    .subtract(1, 'week')
    .startOf('isoweek')
    .format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayOfPrevIsoDateTimePeriod('week', dateFormat),
    expectedDate1,
    `getFirstDayOfPrevIsoDateTimePeriod should return: ${expectedDate1}`
  );

  var expectedDate2 = moment()
    .subtract(1, 'month')
    .startOf('month')
    .format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayOfPrevIsoDateTimePeriod('month', dateFormat),
    expectedDate2,
    `getFirstDayOfPrevIsoDateTimePeriod should return: ${expectedDate2}`
  );

  var expectedDate3 = moment()
    .subtract(1, 'year')
    .startOf('year')
    .format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayOfPrevIsoDateTimePeriod('year', dateFormat),
    expectedDate3,
    `getFirstDayOfPrevIsoDateTimePeriod should return: ${expectedDate3}`
  );

  var expectedDate4 = moment()
    .subtract(1, 'day')
    .startOf('day')
    .format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayOfPrevIsoDateTimePeriod('day', dateFormat),
    expectedDate4,
    `getFirstDayOfPrevIsoDateTimePeriod should return: ${expectedDate4}`
  );
});

test('getLastDayOfPrevIsoDateTimePeriod - unit tests', function(assert) {
  assert.expect(4);

  let dateFormat = 'YYYY-MM-DD';

  let expectedDate1 = moment()
    .startOf('isoweek')
    .subtract(1, 'day')
    .format(dateFormat);
  assert.equal(
    DateUtils.getLastDayOfPrevIsoDateTimePeriod('week', dateFormat),
    expectedDate1,
    'getLastDayOfPrevIsoDateTimePeriod should return: ' + expectedDate1
  );

  let expectedDate2 = moment()
    .startOf('month')
    .subtract(1, 'day')
    .format(dateFormat);
  assert.equal(
    DateUtils.getLastDayOfPrevIsoDateTimePeriod('month', dateFormat),
    expectedDate2,
    'getLastDayOfPrevIsoDateTimePeriod should return: ' + expectedDate2
  );

  let expectedDate3 = moment()
    .startOf('year')
    .subtract(1, 'day')
    .format(dateFormat);
  assert.equal(
    DateUtils.getLastDayOfPrevIsoDateTimePeriod('year', dateFormat),
    expectedDate3,
    'getFirstDayOfPrevIsoDateTimePeriod should return: ' + expectedDate3
  );

  let expectedDate4 = moment()
    .startOf('day')
    .subtract(1, 'day')
    .format(dateFormat);
  assert.equal(
    DateUtils.getLastDayOfPrevIsoDateTimePeriod('day', dateFormat),
    expectedDate4,
    'getFirstDayOfPrevIsoDateTimePeriod should return: ' + expectedDate4
  );
});

test('getFirstDayEpochIsoDateTimePeriod - Epoc date as mid of DateTimePeriod', function(assert) {
  assert.expect(3);

  let dateFormat = 'YYYY-MM-DD',
    originalEpoch = config.navi.dataEpoch;

  config.navi.dataEpoch = '2012-10-17';
  let expectedEpocDate1 = moment('2012-10-22').format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayEpochIsoDateTimePeriod('week', dateFormat),
    expectedEpocDate1,
    'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate1
  );

  let expectedEpocDate2 = moment('2012-11-01').format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayEpochIsoDateTimePeriod('month', dateFormat),
    expectedEpocDate2,
    'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate2
  );

  let expectedEpocDate3 = moment('2013-01-01').format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayEpochIsoDateTimePeriod('year', dateFormat),
    expectedEpocDate3,
    'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate3
  );

  // Set back to original values to avoid affecting other tests
  config.navi.dataEpoch = originalEpoch;
});

test('getFirstDayEpochIsoDateTimePeriod - Epoc date as start of DateTimePeriod', function(assert) {
  assert.expect(4);

  let dateFormat = 'YYYY-MM-DD',
    originalEpoch = config.navi.dataEpoch;

  config.navi.dataEpoch = '2012-10-17';
  let expectedEpocDate1 = moment('2012-10-17').format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayEpochIsoDateTimePeriod('day', dateFormat),
    expectedEpocDate1,
    'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate1
  );

  config.navi.dataEpoch = '2012-10-15';
  let expectedEpocDate2 = moment('2012-10-15').format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayEpochIsoDateTimePeriod('week', dateFormat),
    expectedEpocDate2,
    'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate2
  );

  config.navi.dataEpoch = '2012-10-01';
  let expectedEpocDate3 = moment('2012-10-01').format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayEpochIsoDateTimePeriod('month', dateFormat),
    expectedEpocDate3,
    'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate3
  );

  config.navi.dataEpoch = '2012-01-01';
  let expectedEpocDate4 = moment('2012-01-01').format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayEpochIsoDateTimePeriod('year', dateFormat),
    expectedEpocDate4,
    'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate4
  );

  // Set back to original values to avoid affecting other tests
  config.navi.dataEpoch = originalEpoch;
});

test('getFirstDayOfIsoDateTimePeriod - unit tests', function(assert) {
  assert.expect(10);

  let dateFormat = DateUtils.API_DATE_FORMAT_STRING;

  assert.throws(
    () =>
      DateUtils.getFirstDayOfIsoDateTimePeriod(undefined, 'week', dateFormat),
    'Threw an error as expected'
  );

  let expectedDate1 = moment('2014-10-13').format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayOfIsoDateTimePeriod(
      moment('2014-10-15'),
      'week',
      dateFormat
    ),
    expectedDate1,
    'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate1 + ' as expected'
  );

  assert.throws(
    () => DateUtils.getFirstDayOfIsoDateTimePeriod(),
    'Threw an error as expected'
  );

  let expectedDate2 = moment()
    .startOf('isoweek')
    .format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayOfIsoDateTimePeriod(moment(), 'week'),
    expectedDate2,
    'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate2 + ' as expected'
  );

  let expectedDate3 = moment()
    .startOf('month')
    .format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayOfIsoDateTimePeriod(moment(), 'month'),
    expectedDate3,
    'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate3 + ' as expected'
  );

  let expectedDate4 = moment('2014-10-01').format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayOfIsoDateTimePeriod(moment('2014-10-03'), 'month'),
    expectedDate4,
    'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate4 + ' as expected'
  );

  let expectedDate5 = moment()
    .startOf('year')
    .format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayOfIsoDateTimePeriod(moment(), 'year'),
    expectedDate5,
    'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate5 + ' as expected'
  );

  let expectedDate6 = moment('2014-01-01').format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayOfIsoDateTimePeriod(moment('2014-10-03'), 'year'),
    expectedDate6,
    'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate6 + ' as expected'
  );

  let expectedDate7 = moment()
    .startOf('day')
    .format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayOfIsoDateTimePeriod(moment(), 'day'),
    expectedDate7,
    'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate7 + ' as expected'
  );

  let expectedDate8 = moment('2014-10-03').format(dateFormat);
  assert.equal(
    DateUtils.getFirstDayOfIsoDateTimePeriod(moment('2014-10-03'), 'day'),
    expectedDate8,
    'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate8 + ' as expected'
  );
});

test('getLastDayOfIsoDateTimePeriod - unit tests', function(assert) {
  assert.expect(10);

  let dateFormat = DateUtils.API_DATE_FORMAT_STRING,
    dateFormat1 = DateUtils.PARAM_DATE_FORMAT_STRING;

  assert.throws(
    () =>
      DateUtils.getLastDayOfIsoDateTimePeriod(undefined, 'week', dateFormat1),
    'Threw an error as expected'
  );

  let expectedDate1 = moment('2014-10-19').format(dateFormat1);
  assert.equal(
    DateUtils.getLastDayOfIsoDateTimePeriod(
      moment('2014-10-15'),
      'week',
      dateFormat1
    ),
    expectedDate1,
    'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate1 + ' as expected'
  );

  assert.throws(
    () => DateUtils.getLastDayOfIsoDateTimePeriod(),
    'Threw an error as expected'
  );

  let expectedDate2 = moment()
    .endOf('isoweek')
    .format(dateFormat);
  assert.equal(
    DateUtils.getLastDayOfIsoDateTimePeriod(moment(), 'week'),
    expectedDate2,
    'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate2 + ' as expected'
  );

  let expectedDate3 = moment()
    .endOf('month')
    .format(dateFormat);
  assert.equal(
    DateUtils.getLastDayOfIsoDateTimePeriod(moment(), 'month'),
    expectedDate3,
    'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate3 + ' as expected'
  );

  let expectedDate4 = moment('2014-10-31').format(dateFormat1);
  assert.equal(
    DateUtils.getLastDayOfIsoDateTimePeriod(
      moment('2014-10-23'),
      'month',
      dateFormat1
    ),
    expectedDate4,
    'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate4 + ' as expected'
  );

  let expectedDate5 = moment()
    .endOf('year')
    .format(dateFormat);
  assert.equal(
    DateUtils.getLastDayOfIsoDateTimePeriod(moment(), 'year'),
    expectedDate5,
    'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate5 + ' as expected'
  );

  let expectedDate6 = moment('2014-12-31').format(dateFormat1);
  assert.equal(
    DateUtils.getLastDayOfIsoDateTimePeriod(
      moment('2014-10-23'),
      'year',
      dateFormat1
    ),
    expectedDate6,
    'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate6 + ' as expected'
  );

  let expectedDate7 = moment()
    .endOf('day')
    .format(dateFormat);
  assert.equal(
    DateUtils.getLastDayOfIsoDateTimePeriod(moment(), 'day'),
    expectedDate7,
    'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate7 + ' as expected'
  );

  let expectedDate8 = moment('2014-10-23').format(dateFormat1);
  assert.equal(
    DateUtils.getLastDayOfIsoDateTimePeriod(
      moment('2014-10-23'),
      'day',
      dateFormat1
    ),
    expectedDate8,
    'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate8 + ' as expected'
  );
});

test('getIsoDateTimePeriod - unit tests', function(assert) {
  assert.expect(6);

  let isoDateTimePeriod1 = 'day';
  assert.equal(
    DateUtils.getIsoDateTimePeriod('day'),
    isoDateTimePeriod1,
    'getIsoDateTimePeriod returned: ' + isoDateTimePeriod1 + ' as expected'
  );

  let isoDateTimePeriod2 = 'isoweek';
  assert.equal(
    DateUtils.getIsoDateTimePeriod('week'),
    isoDateTimePeriod2,
    'getIsoDateTimePeriod returned: ' + isoDateTimePeriod2 + ' as expected'
  );

  let isoDateTimePeriod3 = 'month';
  assert.equal(
    DateUtils.getIsoDateTimePeriod('month'),
    isoDateTimePeriod3,
    'getIsoDateTimePeriod returned: ' + isoDateTimePeriod3 + ' as expected'
  );

  let isoDateTimePeriod4 = 'year';
  assert.equal(
    DateUtils.getIsoDateTimePeriod('year'),
    isoDateTimePeriod4,
    'getIsoDateTimePeriod returned: ' + isoDateTimePeriod4 + ' as expected'
  );

  let isoDateTimePeriod5 = 'invalid';
  assert.equal(
    DateUtils.getIsoDateTimePeriod('invalid'),
    isoDateTimePeriod5,
    'getIsoDateTimePeriod returned: ' + isoDateTimePeriod5 + ' as expected'
  );

  assert.throws(
    () => DateUtils.getIsoDateTimePeriod(),
    'Threw an error as expected'
  );
});
