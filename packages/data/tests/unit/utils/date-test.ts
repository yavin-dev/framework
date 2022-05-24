import { getFirstDayEpochForGrain } from 'navi-data/utils/date';
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
});
