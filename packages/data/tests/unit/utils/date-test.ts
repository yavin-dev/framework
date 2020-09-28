import {
  getFirstDayOfPrevIsoDateTimePeriod,
  getFirstDayEpochIsoDateTimePeriod,
  getIsoDateTimePeriod,
  getLastDayOfPrevIsoDateTimePeriod,
  API_DATE_FORMAT_STRING,
  getFirstDayOfIsoDateTimePeriod,
  PARAM_DATE_FORMAT_STRING,
  getLastDayOfIsoDateTimePeriod
} from 'navi-data/utils/date';
import { module, test } from 'qunit';
import moment from 'moment';
import config from 'ember-get-config';

module('Unit | Utils | DateUtils', function() {
  test('getFirstDayOfPrevIsoDateTimePeriod - date format provided', function(assert) {
    assert.expect(4);

    const dateFormat = 'MM-DD-YYYY';

    const expectedDate1 = moment()
      .subtract(1, 'week')
      .startOf('isoWeek')
      .format(dateFormat);
    assert.equal(
      getFirstDayOfPrevIsoDateTimePeriod('week', dateFormat),
      expectedDate1,
      `getFirstDayOfPrevIsoDateTimePeriod should return: ${expectedDate1}`
    );

    const expectedDate2 = moment()
      .subtract(1, 'month')
      .startOf('month')
      .format(dateFormat);
    assert.equal(
      getFirstDayOfPrevIsoDateTimePeriod('month', dateFormat),
      expectedDate2,
      `getFirstDayOfPrevIsoDateTimePeriod should return: ${expectedDate2}`
    );

    const expectedDate3 = moment()
      .subtract(1, 'year')
      .startOf('year')
      .format(dateFormat);
    assert.equal(
      getFirstDayOfPrevIsoDateTimePeriod('year', dateFormat),
      expectedDate3,
      `getFirstDayOfPrevIsoDateTimePeriod should return: ${expectedDate3}`
    );

    const expectedDate4 = moment()
      .subtract(1, 'day')
      .startOf('day')
      .format(dateFormat);
    assert.equal(
      getFirstDayOfPrevIsoDateTimePeriod('day', dateFormat),
      expectedDate4,
      `getFirstDayOfPrevIsoDateTimePeriod should return: ${expectedDate4}`
    );
  });

  test('getLastDayOfPrevIsoDateTimePeriod - unit tests', function(assert) {
    assert.expect(4);

    let dateFormat = 'YYYY-MM-DD';

    let expectedDate1 = moment()
      .startOf('isoWeek')
      .subtract(1, 'day')
      .format(dateFormat);
    assert.equal(
      getLastDayOfPrevIsoDateTimePeriod('week', dateFormat),
      expectedDate1,
      'getLastDayOfPrevIsoDateTimePeriod should return: ' + expectedDate1
    );

    let expectedDate2 = moment()
      .startOf('month')
      .subtract(1, 'day')
      .format(dateFormat);
    assert.equal(
      getLastDayOfPrevIsoDateTimePeriod('month', dateFormat),
      expectedDate2,
      'getLastDayOfPrevIsoDateTimePeriod should return: ' + expectedDate2
    );

    let expectedDate3 = moment()
      .startOf('year')
      .subtract(1, 'day')
      .format(dateFormat);
    assert.equal(
      getLastDayOfPrevIsoDateTimePeriod('year', dateFormat),
      expectedDate3,
      'getFirstDayOfPrevIsoDateTimePeriod should return: ' + expectedDate3
    );

    let expectedDate4 = moment()
      .startOf('day')
      .subtract(1, 'day')
      .format(dateFormat);
    assert.equal(
      getLastDayOfPrevIsoDateTimePeriod('day', dateFormat),
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
      getFirstDayEpochIsoDateTimePeriod('week', dateFormat),
      expectedEpocDate1,
      'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate1
    );

    let expectedEpocDate2 = moment('2012-11-01').format(dateFormat);
    assert.equal(
      getFirstDayEpochIsoDateTimePeriod('month', dateFormat),
      expectedEpocDate2,
      'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate2
    );

    let expectedEpocDate3 = moment('2013-01-01').format(dateFormat);
    assert.equal(
      getFirstDayEpochIsoDateTimePeriod('year', dateFormat),
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
      getFirstDayEpochIsoDateTimePeriod('day', dateFormat),
      expectedEpocDate1,
      'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate1
    );

    config.navi.dataEpoch = '2012-10-15';
    let expectedEpocDate2 = moment('2012-10-15').format(dateFormat);
    assert.equal(
      getFirstDayEpochIsoDateTimePeriod('week', dateFormat),
      expectedEpocDate2,
      'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate2
    );

    config.navi.dataEpoch = '2012-10-01';
    let expectedEpocDate3 = moment('2012-10-01').format(dateFormat);
    assert.equal(
      getFirstDayEpochIsoDateTimePeriod('month', dateFormat),
      expectedEpocDate3,
      'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate3
    );

    config.navi.dataEpoch = '2012-01-01';
    let expectedEpocDate4 = moment('2012-01-01').format(dateFormat);
    assert.equal(
      getFirstDayEpochIsoDateTimePeriod('year', dateFormat),
      expectedEpocDate4,
      'getFirstDayEpochIsoDateTimePeriod should return: ' + expectedEpocDate4
    );

    // Set back to original values to avoid affecting other tests
    config.navi.dataEpoch = originalEpoch;
  });

  test('getFirstDayOfIsoDateTimePeriod - unit tests', function(assert) {
    assert.expect(10);

    let dateFormat = API_DATE_FORMAT_STRING;

    assert.throws(
      //@ts-expect-error
      () => getFirstDayOfIsoDateTimePeriod(undefined, 'week', dateFormat),
      'Threw an error as expected'
    );

    let expectedDate1 = moment('2014-10-13').format(dateFormat);
    assert.equal(
      getFirstDayOfIsoDateTimePeriod(moment('2014-10-15'), 'week', dateFormat),
      expectedDate1,
      'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate1 + ' as expected'
    );

    //@ts-expect-error
    assert.throws(() => getFirstDayOfIsoDateTimePeriod(), 'Threw an error as expected');

    let expectedDate2 = moment()
      .startOf('isoWeek')
      .format(dateFormat);
    assert.equal(
      getFirstDayOfIsoDateTimePeriod(moment(), 'week'),
      expectedDate2,
      'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate2 + ' as expected'
    );

    let expectedDate3 = moment()
      .startOf('month')
      .format(dateFormat);
    assert.equal(
      getFirstDayOfIsoDateTimePeriod(moment(), 'month'),
      expectedDate3,
      'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate3 + ' as expected'
    );

    let expectedDate4 = moment('2014-10-01').format(dateFormat);
    assert.equal(
      getFirstDayOfIsoDateTimePeriod(moment('2014-10-03'), 'month'),
      expectedDate4,
      'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate4 + ' as expected'
    );

    let expectedDate5 = moment()
      .startOf('year')
      .format(dateFormat);
    assert.equal(
      getFirstDayOfIsoDateTimePeriod(moment(), 'year'),
      expectedDate5,
      'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate5 + ' as expected'
    );

    let expectedDate6 = moment('2014-01-01').format(dateFormat);
    assert.equal(
      getFirstDayOfIsoDateTimePeriod(moment('2014-10-03'), 'year'),
      expectedDate6,
      'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate6 + ' as expected'
    );

    let expectedDate7 = moment()
      .startOf('day')
      .format(dateFormat);
    assert.equal(
      getFirstDayOfIsoDateTimePeriod(moment(), 'day'),
      expectedDate7,
      'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate7 + ' as expected'
    );

    let expectedDate8 = moment('2014-10-03').format(dateFormat);
    assert.equal(
      getFirstDayOfIsoDateTimePeriod(moment('2014-10-03'), 'day'),
      expectedDate8,
      'getFirstDayOfIsoDateTimePeriod returned: ' + expectedDate8 + ' as expected'
    );
  });

  test('getLastDayOfIsoDateTimePeriod - unit tests', function(assert) {
    assert.expect(10);

    let dateFormat = API_DATE_FORMAT_STRING,
      dateFormat1 = PARAM_DATE_FORMAT_STRING;

    assert.throws(
      //@ts-expect-error
      () => getLastDayOfIsoDateTimePeriod(undefined, 'week', dateFormat1),
      'Threw an error as expected'
    );

    let expectedDate1 = moment('2014-10-19').format(dateFormat1);
    assert.equal(
      getLastDayOfIsoDateTimePeriod(moment('2014-10-15'), 'week', dateFormat1),
      expectedDate1,
      'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate1 + ' as expected'
    );

    //@ts-expect-error
    assert.throws(() => getLastDayOfIsoDateTimePeriod(), 'Threw an error as expected');

    let expectedDate2 = moment()
      .endOf('isoWeek')
      .format(dateFormat);
    assert.equal(
      getLastDayOfIsoDateTimePeriod(moment(), 'week'),
      expectedDate2,
      'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate2 + ' as expected'
    );

    let expectedDate3 = moment()
      .endOf('month')
      .format(dateFormat);
    assert.equal(
      getLastDayOfIsoDateTimePeriod(moment(), 'month'),
      expectedDate3,
      'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate3 + ' as expected'
    );

    let expectedDate4 = moment('2014-10-31').format(dateFormat1);
    assert.equal(
      getLastDayOfIsoDateTimePeriod(moment('2014-10-23'), 'month', dateFormat1),
      expectedDate4,
      'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate4 + ' as expected'
    );

    let expectedDate5 = moment()
      .endOf('year')
      .format(dateFormat);
    assert.equal(
      getLastDayOfIsoDateTimePeriod(moment(), 'year'),
      expectedDate5,
      'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate5 + ' as expected'
    );

    let expectedDate6 = moment('2014-12-31').format(dateFormat1);
    assert.equal(
      getLastDayOfIsoDateTimePeriod(moment('2014-10-23'), 'year', dateFormat1),
      expectedDate6,
      'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate6 + ' as expected'
    );

    let expectedDate7 = moment()
      .endOf('day')
      .format(dateFormat);
    assert.equal(
      getLastDayOfIsoDateTimePeriod(moment(), 'day'),
      expectedDate7,
      'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate7 + ' as expected'
    );

    let expectedDate8 = moment('2014-10-23').format(dateFormat1);
    assert.equal(
      getLastDayOfIsoDateTimePeriod(moment('2014-10-23'), 'day', dateFormat1),
      expectedDate8,
      'getLastDayOfIsoDateTimePeriod returned: ' + expectedDate8 + ' as expected'
    );
  });

  test('getIsoDateTimePeriod - unit tests', function(assert) {
    assert.expect(6);

    let isoDateTimePeriod1 = 'day';
    assert.equal(
      getIsoDateTimePeriod('day'),
      isoDateTimePeriod1,
      'getIsoDateTimePeriod returned: ' + isoDateTimePeriod1 + ' as expected'
    );

    let isoDateTimePeriod2 = 'isoWeek';
    assert.equal(
      getIsoDateTimePeriod('week'),
      isoDateTimePeriod2,
      'getIsoDateTimePeriod returned: ' + isoDateTimePeriod2 + ' as expected'
    );

    let isoDateTimePeriod3 = 'month';
    assert.equal(
      getIsoDateTimePeriod('month'),
      isoDateTimePeriod3,
      'getIsoDateTimePeriod returned: ' + isoDateTimePeriod3 + ' as expected'
    );

    let isoDateTimePeriod4 = 'year';
    assert.equal(
      getIsoDateTimePeriod('year'),
      isoDateTimePeriod4,
      'getIsoDateTimePeriod returned: ' + isoDateTimePeriod4 + ' as expected'
    );

    let isoDateTimePeriod5 = 'invalid';
    assert.equal(
      //@ts-expect-error
      getIsoDateTimePeriod('invalid'),
      isoDateTimePeriod5,
      'getIsoDateTimePeriod returned: ' + isoDateTimePeriod5 + ' as expected'
    );

    //@ts-expect-error
    assert.throws(() => getIsoDateTimePeriod(), 'Threw an error as expected');
  });
});
