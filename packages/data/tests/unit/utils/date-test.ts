import {
  API_DATE_FORMAT_STRING,
  getFirstDayOfGrain,
  PARAM_DATE_FORMAT_STRING,
  getLastDayOfGrain,
  getLastDayOfGrainBefore,
  getFirstDayEpochForGrain,
  getFirstDayOfGrainAfter,
  getPeriodForGrain,
} from 'navi-data/utils/date';
import { module, test } from 'qunit';
import moment from 'moment';
import config from 'ember-get-config';

module('Unit | Utils | DateUtils', function () {
  test('getFirstDayEpochForGrain - Epoch date as mid of DateTimePeriod', function (assert) {
    const dateFormat = 'YYYY-MM-DD';
    const originalEpoch = config.navi.dataEpoch;

    config.navi.dataEpoch = '2012-10-17';
    let expectedEpocDate1 = moment('2012-10-22').format(dateFormat);
    assert.equal(
      getFirstDayEpochForGrain('isoWeek', dateFormat),
      expectedEpocDate1,
      'getFirstDayEpochForGrain should return: ' + expectedEpocDate1
    );

    let expectedEpocDate2 = moment('2012-11-01').format(dateFormat);
    assert.equal(
      getFirstDayEpochForGrain('month', dateFormat),
      expectedEpocDate2,
      'getFirstDayEpochForGrain should return: ' + expectedEpocDate2
    );

    let expectedEpocDate3 = moment('2013-01-01').format(dateFormat);
    assert.equal(
      getFirstDayEpochForGrain('year', dateFormat),
      expectedEpocDate3,
      'getFirstDayEpochForGrain should return: ' + expectedEpocDate3
    );

    // Set back to original values to avoid affecting other tests
    config.navi.dataEpoch = originalEpoch;
  });

  test('getFirstDayEpochForGrain - Epoc date as start of DateTimePeriod', function (assert) {
    const dateFormat = 'YYYY-MM-DD';
    const originalEpoch = config.navi.dataEpoch;

    config.navi.dataEpoch = '2012-10-17';
    let expectedEpocDate1 = moment('2012-10-17').format(dateFormat);
    assert.equal(
      getFirstDayEpochForGrain('day', dateFormat),
      expectedEpocDate1,
      'getFirstDayEpochForGrain should return: ' + expectedEpocDate1
    );

    config.navi.dataEpoch = '2012-10-15';
    let expectedEpocDate2 = moment('2012-10-15').format(dateFormat);
    assert.equal(
      getFirstDayEpochForGrain('isoWeek', dateFormat),
      expectedEpocDate2,
      'getFirstDayEpochForGrain should return: ' + expectedEpocDate2
    );

    config.navi.dataEpoch = '2012-10-01';
    let expectedEpocDate3 = moment('2012-10-01').format(dateFormat);
    assert.equal(
      getFirstDayEpochForGrain('month', dateFormat),
      expectedEpocDate3,
      'getFirstDayEpochForGrain should return: ' + expectedEpocDate3
    );

    config.navi.dataEpoch = '2012-01-01';
    let expectedEpocDate4 = moment('2012-01-01').format(dateFormat);
    assert.equal(
      getFirstDayEpochForGrain('year', dateFormat),
      expectedEpocDate4,
      'getFirstDayEpochForGrain should return: ' + expectedEpocDate4
    );

    // Set back to original values to avoid affecting other tests
    config.navi.dataEpoch = originalEpoch;
  });

  test('getFirstDayOfGrain - unit tests', function (assert) {
    const dateFormat = API_DATE_FORMAT_STRING;

    let expectedDate1 = moment('2014-10-13').format(dateFormat);
    assert.equal(
      getFirstDayOfGrain(moment('2014-10-15'), 'isoWeek', dateFormat),
      expectedDate1,
      'getFirstDayOfGrain returned: ' + expectedDate1 + ' as expected'
    );

    let expectedDate2 = moment().startOf('isoWeek').format(dateFormat);
    assert.equal(
      getFirstDayOfGrain(moment(), 'isoWeek'),
      expectedDate2,
      'getFirstDayOfGrain returned: ' + expectedDate2 + ' as expected'
    );

    let expectedDate3 = moment().startOf('month').format(dateFormat);
    assert.equal(
      getFirstDayOfGrain(moment(), 'month'),
      expectedDate3,
      'getFirstDayOfGrain returned: ' + expectedDate3 + ' as expected'
    );

    let expectedDate4 = moment('2014-10-01').format(dateFormat);
    assert.equal(
      getFirstDayOfGrain(moment('2014-10-03'), 'month'),
      expectedDate4,
      'getFirstDayOfGrain returned: ' + expectedDate4 + ' as expected'
    );

    let expectedDate5 = moment().startOf('year').format(dateFormat);
    assert.equal(
      getFirstDayOfGrain(moment(), 'year'),
      expectedDate5,
      'getFirstDayOfGrain returned: ' + expectedDate5 + ' as expected'
    );

    let expectedDate6 = moment('2014-01-01').format(dateFormat);
    assert.equal(
      getFirstDayOfGrain(moment('2014-10-03'), 'year'),
      expectedDate6,
      'getFirstDayOfGrain returned: ' + expectedDate6 + ' as expected'
    );

    let expectedDate7 = moment().startOf('day').format(dateFormat);
    assert.equal(
      getFirstDayOfGrain(moment(), 'day'),
      expectedDate7,
      'getFirstDayOfGrain returned: ' + expectedDate7 + ' as expected'
    );

    let expectedDate8 = moment('2014-10-03').format(dateFormat);
    assert.equal(
      getFirstDayOfGrain(moment('2014-10-03'), 'day'),
      expectedDate8,
      'getFirstDayOfGrain returned: ' + expectedDate8 + ' as expected'
    );
  });

  test('getFirstDayOfGrainAfter - unit tests', function (assert) {
    let expectedDate1 = moment('2014-10-20').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainAfter(moment('2014-10-15'), 'isoWeek', API_DATE_FORMAT_STRING),
      expectedDate1,
      'getFirstDayOfGrainAfter returned: ' + expectedDate1 + ' as expected'
    );

    let expectedDate2 = moment().add(1, 'week').subtract(1, 'day').startOf('isoWeek').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainAfter(moment(), 'isoWeek'),
      expectedDate2,
      'getFirstDayOfGrainAfter returned: ' + expectedDate2 + ' as expected'
    );

    let expectedDate3 = moment('2014-10-01').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainAfter(moment('2014-09-15'), 'month', API_DATE_FORMAT_STRING),
      expectedDate3,
      'getFirstDayOfGrainAfter returned: ' + expectedDate3 + ' as expected'
    );

    let expectedDate4 = moment().add(1, 'month').subtract(1, 'day').startOf('month').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainAfter(moment(), 'month'),
      expectedDate4,
      'getFirstDayOfGrainAfter returned: ' + expectedDate4 + ' as expected'
    );

    let expectedDate5 = moment('2014-01-01').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainAfter(moment('2013-09-15'), 'year', API_DATE_FORMAT_STRING),
      expectedDate5,
      'getFirstDayOfGrainAfter returned: ' + expectedDate5 + ' as expected'
    );

    let expectedDate6 = moment().add(1, 'year').subtract(1, 'day').startOf('year').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainAfter(moment(), 'year'),
      expectedDate6,
      'getFirstDayOfGrainAfter returned: ' + expectedDate6 + ' as expected'
    );

    let expectedDate7 = moment('2013-09-15').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainAfter(moment('2013-09-15'), 'day', API_DATE_FORMAT_STRING),
      expectedDate7,
      'getFirstDayOfGrainAfter returned: ' + expectedDate7 + ' as expected'
    );

    let expectedDate8 = moment().startOf('day').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainAfter(moment(), 'day'),
      expectedDate8,
      'getFirstDayOfGrainAfter returned: ' + expectedDate8 + ' as expected'
    );
  });

  test('getLastDayOfGrain - unit tests', function (assert) {
    const dateFormat = API_DATE_FORMAT_STRING;
    const dateFormat1 = PARAM_DATE_FORMAT_STRING;

    let expectedDate1 = moment('2014-10-19').format(dateFormat1);
    assert.equal(
      getLastDayOfGrain(moment('2014-10-15'), 'isoWeek', dateFormat1),
      expectedDate1,
      'getLastDayOfGrain returned: ' + expectedDate1 + ' as expected'
    );

    let expectedDate2 = moment().endOf('isoWeek').format(dateFormat);
    assert.equal(
      getLastDayOfGrain(moment(), 'isoWeek'),
      expectedDate2,
      'getLastDayOfGrain returned: ' + expectedDate2 + ' as expected'
    );

    let expectedDate3 = moment().endOf('month').format(dateFormat);
    assert.equal(
      getLastDayOfGrain(moment(), 'month'),
      expectedDate3,
      'getLastDayOfGrain returned: ' + expectedDate3 + ' as expected'
    );

    let expectedDate4 = moment('2014-10-31').format(dateFormat1);
    assert.equal(
      getLastDayOfGrain(moment('2014-10-23'), 'month', dateFormat1),
      expectedDate4,
      'getLastDayOfGrain returned: ' + expectedDate4 + ' as expected'
    );

    let expectedDate5 = moment().endOf('year').format(dateFormat);
    assert.equal(
      getLastDayOfGrain(moment(), 'year'),
      expectedDate5,
      'getLastDayOfGrain returned: ' + expectedDate5 + ' as expected'
    );

    let expectedDate6 = moment('2014-12-31').format(dateFormat1);
    assert.equal(
      getLastDayOfGrain(moment('2014-10-23'), 'year', dateFormat1),
      expectedDate6,
      'getLastDayOfGrain returned: ' + expectedDate6 + ' as expected'
    );

    let expectedDate7 = moment().endOf('day').format(dateFormat);
    assert.equal(
      getLastDayOfGrain(moment(), 'day'),
      expectedDate7,
      'getLastDayOfGrain returned: ' + expectedDate7 + ' as expected'
    );

    let expectedDate8 = moment('2014-10-23').format(dateFormat1);
    assert.equal(
      getLastDayOfGrain(moment('2014-10-23'), 'day', dateFormat1),
      expectedDate8,
      'getLastDayOfGrain returned: ' + expectedDate8 + ' as expected'
    );
  });

  test('getLastDayOfGrainBefore - unit tests', function (assert) {
    let expectedDate1 = moment('2014-10-12').format(PARAM_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainBefore(moment('2014-10-15'), 'isoWeek', PARAM_DATE_FORMAT_STRING),
      expectedDate1,
      'getLastDayOfGrainBefore returned: ' + expectedDate1 + ' as expected'
    );

    let expectedDate2 = moment().subtract(1, 'week').add(1, 'day').endOf('isoWeek').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainBefore(moment(), 'isoWeek'),
      expectedDate2,
      'getLastDayOfGrainBefore returned: ' + expectedDate2 + ' as expected'
    );

    let expectedDate3 = moment('2014-08-31').format(PARAM_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainBefore(moment('2014-09-15'), 'month', PARAM_DATE_FORMAT_STRING),
      expectedDate3,
      'getLastDayOfGrainBefore returned: ' + expectedDate3 + ' as expected'
    );

    let expectedDate4 = moment().subtract(1, 'month').add(1, 'day').endOf('month').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainBefore(moment(), 'month'),
      expectedDate4,
      'getLastDayOfGrainBefore returned: ' + expectedDate4 + ' as expected'
    );

    let expectedDate5 = moment('2012-12-31').format(PARAM_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainBefore(moment('2013-09-15'), 'year', PARAM_DATE_FORMAT_STRING),
      expectedDate5,
      'getLastDayOfGrainBefore returned: ' + expectedDate5 + ' as expected'
    );

    let expectedDate6 = moment().subtract(1, 'year').add(1, 'day').endOf('year').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainBefore(moment(), 'year'),
      expectedDate6,
      'getLastDayOfGrainBefore returned: ' + expectedDate6 + ' as expected'
    );

    let expectedDate7 = moment('2013-09-15').format(PARAM_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainBefore(moment('2013-09-15'), 'day', PARAM_DATE_FORMAT_STRING),
      expectedDate7,
      'getLastDayOfGrainBefore returned: ' + expectedDate7 + ' as expected'
    );

    let expectedDate8 = moment().endOf('day').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainBefore(moment(), 'day'),
      expectedDate8,
      'getLastDayOfGrainBefore returned: ' + expectedDate8 + ' as expected'
    );
  });

  test('getPeriodForGrain', function (assert) {
    assert.equal(getPeriodForGrain('day'), 'day', '`getPeriodForGrain` returns correct period for `day`');
    assert.equal(getPeriodForGrain('week'), 'week', '`getPeriodForGrain` returns correct period for `week`');
    assert.equal(getPeriodForGrain('isoWeek'), 'week', '`getPeriodForGrain` returns correct period for `isoWeek`');
    assert.equal(getPeriodForGrain('month'), 'month', '`getPeriodForGrain` returns correct period for `month`');
    assert.equal(getPeriodForGrain('year'), 'year', '`getPeriodForGrain` returns correct period for `year`');
  });
});
