import { formatDateForGranularity } from 'dummy/helpers/format-date-for-granularity';
import { module, test } from 'qunit';
import moment from 'moment';

module('Unit | Helper | format date for granularity', function() {
  test('all', function(assert) {
    assert.expect(1);

    assert.equal(
      formatDateForGranularity('2016-06-03 11:12:13.000', 'all'),
      '06/03/2016',
      'The date is formatted to only display the month/day/year'
    );
  });

  test('quarter', function(assert) {
    assert.expect(1);

    assert.equal(
      formatDateForGranularity('2016-06-03 11:12:13.000', 'quarter'),
      'Q2 2016',
      'The date is formatted to only display the quarter and year'
    );
  });

  test('week', function(assert) {
    assert.expect(2);

    assert.equal(
      formatDateForGranularity('2015-12-30 00:00:00.000', 'week'),
      '12/30/2015 - 01/05/2016',
      'Week format has both start and end dates'
    );

    assert.equal(
      formatDateForGranularity('2016-06-03 11:12:13.000', 'week'),
      '06/03 - 06/09/2016',
      'When the week is within the same year, only the end date shows the year'
    );
  });

  test('validity', function(assert) {
    assert.expect(5);

    assert.equal(
      formatDateForGranularity('2015-03-02', 'all'),
      '03/02/2015',
      'helper formats date string for a valid date'
    );

    assert.equal(
      formatDateForGranularity(moment('2015-12-30 00:00:00.000'), 'all'),
      '12/30/2015',
      'helper formats date string for a valid moment object'
    );

    assert.equal(formatDateForGranularity('invalid', 'all'), '--', "helper returns '--' for an invalid date");

    assert.equal(formatDateForGranularity(null), '--', "helper returns '--' for null");

    assert.equal(formatDateForGranularity(), '--', "helper returns '--' for undefined");
  });
});
