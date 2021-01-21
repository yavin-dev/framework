import {
  API_DATE_FORMAT_STRING,
  getFirstDayOfGrain,
  PARAM_DATE_FORMAT_STRING,
  getLastDayOfGrain,
  getFirstDayEpochForGrain,
  getPeriodForGrain
} from 'navi-data/utils/date';
import { module, test } from 'qunit';
import moment from 'moment';
import config from 'ember-get-config';

module('Unit | Utils | DateUtils', function() {
  test('getFirstDayEpochForGrain - Epoch date as mid of DateTimePeriod', function(assert) {
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

  test('getFirstDayEpochForGrain - Epoc date as start of DateTimePeriod', function(assert) {
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

  test('getFirstDayOfGrain - unit tests', function(assert) {
    const dateFormat = API_DATE_FORMAT_STRING;

    let expectedDate1 = moment('2014-10-13').format(dateFormat);
    assert.equal(
      getFirstDayOfGrain(moment('2014-10-15'), 'isoWeek', dateFormat),
      expectedDate1,
      'getFirstDayOfGrain returned: ' + expectedDate1 + ' as expected'
    );

    let expectedDate2 = moment()
      .startOf('isoWeek')
      .format(dateFormat);
    assert.equal(
      getFirstDayOfGrain(moment(), 'isoWeek'),
      expectedDate2,
      'getFirstDayOfGrain returned: ' + expectedDate2 + ' as expected'
    );

    let expectedDate3 = moment()
      .startOf('month')
      .format(dateFormat);
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

    let expectedDate5 = moment()
      .startOf('year')
      .format(dateFormat);
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

    let expectedDate7 = moment()
      .startOf('day')
      .format(dateFormat);
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

  test('getLastDayOfGrain - unit tests', function(assert) {
    const dateFormat = API_DATE_FORMAT_STRING;
    const dateFormat1 = PARAM_DATE_FORMAT_STRING;

    let expectedDate1 = moment('2014-10-19').format(dateFormat1);
    assert.equal(
      getLastDayOfGrain(moment('2014-10-15'), 'isoWeek', dateFormat1),
      expectedDate1,
      'getLastDayOfGrain returned: ' + expectedDate1 + ' as expected'
    );

    let expectedDate2 = moment()
      .endOf('isoWeek')
      .format(dateFormat);
    assert.equal(
      getLastDayOfGrain(moment(), 'isoWeek'),
      expectedDate2,
      'getLastDayOfGrain returned: ' + expectedDate2 + ' as expected'
    );

    let expectedDate3 = moment()
      .endOf('month')
      .format(dateFormat);
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

    let expectedDate5 = moment()
      .endOf('year')
      .format(dateFormat);
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

    let expectedDate7 = moment()
      .endOf('day')
      .format(dateFormat);
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

  test('getPeriodForGrain', function(assert) {
    assert.equal(getPeriodForGrain('day'), 'day', '`getPeriodForGrain` returns correct period for `day`');
    assert.equal(getPeriodForGrain('week'), 'week', '`getPeriodForGrain` returns correct period for `week`');
    assert.equal(getPeriodForGrain('isoWeek'), 'week', '`getPeriodForGrain` returns correct period for `isoWeek`');
    assert.equal(getPeriodForGrain('month'), 'month', '`getPeriodForGrain` returns correct period for `month`');
    assert.equal(getPeriodForGrain('year'), 'year', '`getPeriodForGrain` returns correct period for `year`');
  });
});
