import {
  API_DATE_FORMAT_STRING,
  getFirstDayOfGrain,
  PARAM_DATE_FORMAT_STRING,
  getLastDayOfGrain,
  getLastDayOfGrainUntil,
  getFirstDayOfGrainSince,
  getPeriodForGrain,
} from '@yavin/client/utils/date';
import { module, test } from 'qunit';
import moment from 'moment';

module('Unit | Utils | DateUtils', function () {
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

  test('getFirstDayOfGrainSince - unit tests', function (assert) {
    let expectedDate1 = moment('2014-10-20').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainSince(moment('2014-10-15'), 'isoWeek', API_DATE_FORMAT_STRING),
      expectedDate1,
      'getFirstDayOfGrainSince returned: ' + expectedDate1 + ' as expected'
    );

    let expectedDate2 = moment().add(1, 'week').subtract(1, 'day').startOf('isoWeek').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainSince(moment(), 'isoWeek'),
      expectedDate2,
      'getFirstDayOfGrainSince returned: ' + expectedDate2 + ' as expected'
    );

    let expectedDate3 = moment('2014-10-01').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainSince(moment('2014-09-15'), 'month', API_DATE_FORMAT_STRING),
      expectedDate3,
      'getFirstDayOfGrainSince returned: ' + expectedDate3 + ' as expected'
    );

    let expectedDate4 = moment().add(1, 'month').subtract(1, 'day').startOf('month').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainSince(moment(), 'month'),
      expectedDate4,
      'getFirstDayOfGrainSince returned: ' + expectedDate4 + ' as expected'
    );

    let expectedDate5 = moment('2014-01-01').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainSince(moment('2013-09-15'), 'year', API_DATE_FORMAT_STRING),
      expectedDate5,
      'getFirstDayOfGrainSince returned: ' + expectedDate5 + ' as expected'
    );

    let expectedDate6 = moment().add(1, 'year').subtract(1, 'day').startOf('year').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainSince(moment(), 'year'),
      expectedDate6,
      'getFirstDayOfGrainSince returned: ' + expectedDate6 + ' as expected'
    );

    let expectedDate7 = moment('2013-09-15').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainSince(moment('2013-09-15'), 'day', API_DATE_FORMAT_STRING),
      expectedDate7,
      'getFirstDayOfGrainSince returned: ' + expectedDate7 + ' as expected'
    );

    let expectedDate8 = moment().startOf('day').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getFirstDayOfGrainSince(moment(), 'day'),
      expectedDate8,
      'getFirstDayOfGrainSince returned: ' + expectedDate8 + ' as expected'
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

  test('getLastDayOfGrainUntil - unit tests', function (assert) {
    let expectedDate1 = moment('2014-10-12').format(PARAM_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainUntil(moment('2014-10-15'), 'isoWeek', PARAM_DATE_FORMAT_STRING),
      expectedDate1,
      'getLastDayOfGrainUntil returned: ' + expectedDate1 + ' as expected'
    );

    let expectedDate2 = moment().subtract(1, 'week').add(1, 'day').endOf('isoWeek').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainUntil(moment(), 'isoWeek'),
      expectedDate2,
      'getLastDayOfGrainUntil returned: ' + expectedDate2 + ' as expected'
    );

    let expectedDate3 = moment('2014-08-31').format(PARAM_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainUntil(moment('2014-09-15'), 'month', PARAM_DATE_FORMAT_STRING),
      expectedDate3,
      'getLastDayOfGrainUntil returned: ' + expectedDate3 + ' as expected'
    );

    let expectedDate4 = moment().subtract(1, 'month').add(1, 'day').endOf('month').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainUntil(moment(), 'month'),
      expectedDate4,
      'getLastDayOfGrainUntil returned: ' + expectedDate4 + ' as expected'
    );

    let expectedDate5 = moment('2012-12-31').format(PARAM_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainUntil(moment('2013-09-15'), 'year', PARAM_DATE_FORMAT_STRING),
      expectedDate5,
      'getLastDayOfGrainUntil returned: ' + expectedDate5 + ' as expected'
    );

    let expectedDate6 = moment().subtract(1, 'year').add(1, 'day').endOf('year').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainUntil(moment(), 'year'),
      expectedDate6,
      'getLastDayOfGrainUntil returned: ' + expectedDate6 + ' as expected'
    );

    let expectedDate7 = moment('2013-09-15').format(PARAM_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainUntil(moment('2013-09-15'), 'day', PARAM_DATE_FORMAT_STRING),
      expectedDate7,
      'getLastDayOfGrainUntil returned: ' + expectedDate7 + ' as expected'
    );

    let expectedDate8 = moment().endOf('day').format(API_DATE_FORMAT_STRING);
    assert.equal(
      getLastDayOfGrainUntil(moment(), 'day'),
      expectedDate8,
      'getLastDayOfGrainUntil returned: ' + expectedDate8 + ' as expected'
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
