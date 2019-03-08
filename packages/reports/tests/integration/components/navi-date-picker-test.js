import { run, next } from '@ember/runloop';
import moment from 'moment';
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import config from 'ember-get-config';

const TEST_FORMAT = 'YYYY-MM-DD';

moduleForComponent('navi-date-picker', 'Integration | Component | Navi Date Picker', {
  integration: true
});

test('Select date', function(assert) {
  assert.expect(5);

  this.set('date', moment('2015-07-14', TEST_FORMAT));

  this.render(hbs`
        {{navi-date-picker
            date=date
        }}
    `);

  assert.equal(this.$('.day.active').text(), '14', 'The active day is based on the given date');

  assert.equal(
    this.$('.datepicker-days .datepicker-switch').text(),
    'July 2015',
    'The active month is based on the given date'
  );

  /* == Update date after creation == */
  run(() => {
    this.set('date', moment('2015-06-17', TEST_FORMAT));
  });

  assert.equal(this.$('.day.active').text(), '17', 'The active day is based on the new given date');

  assert.equal(
    this.$('.datepicker-days .datepicker-switch').text(),
    'June 2015',
    'The active month is based on the new given date'
  );

  /* == Date outside of range == */
  run(() => {
    this.set('date', moment('2050-06-17', TEST_FORMAT));
  });

  assert.equal(this.$('.day.active').length, 1, 'No date, even a future date is out of range');
});

test('Change date through calendar, then through attr', function(assert) {
  assert.expect(3);

  let originalDate = moment('2015-07-14', TEST_FORMAT),
    clickDate = moment('2015-07-18', TEST_FORMAT),
    boundDate = moment('2015-07-12', TEST_FORMAT);

  this.set('date', originalDate);

  this.render(hbs`
        {{navi-date-picker
            date=date
        }}
    `);

  // Test clicking on a different date
  findDayElement(this, clickDate).click();

  assert.ok(isDayActive(this, clickDate), 'Clicked date is visibly selected');

  // Change date back through binding
  this.set('date', boundDate);

  assert.ok(isDayActive(this, boundDate), 'Bound date is visibly selected');
  assert.ok(!isDayActive(this, clickDate), 'Clicked date is no longer selected');
});

test('Change date action', function(assert) {
  assert.expect(4);

  let originalDate = moment('2015-07-14', TEST_FORMAT),
    newDate = moment('2015-07-18', TEST_FORMAT);

  this.set('date', originalDate);
  this.set('onUpdate', date => assert.ok(date.isSame(newDate), 'onUpdate action was called with new date'));
  this.render(hbs`
        {{navi-date-picker
            date=date
            onUpdate=(action onUpdate)
        }}
    `);

  // Test clicking on a different date
  findDayElement(this, newDate).click();

  assert.ok(originalDate.isSame(moment('2015-07-14', TEST_FORMAT)), 'date is a one way binding');
  assert.ok(isDayActive(this, newDate), 'New date is visibly selected regardless of action being handled');
  assert.ok(!isDayActive(this, originalDate), 'Original date is no longer selected');

  /*
   * Check that changing `date` to the date suggested by the action does not
   * trigger the action again, causing a cycle
   */
  this.on('onUpdate', () => {
    throw new Error('Action was incorrectly called');
  });
  this.set('date', newDate);

  // Check that clicking on already selected date does not trigger action again
  findDayElement(this, newDate).click();
});

test('Change date action always gives start of time period', async function(assert) {
  assert.expect(1);

  let originalDate = moment('2015-07-14', TEST_FORMAT);

  this.set('date', originalDate);
  this.set('onUpdate', date =>
    assert.ok(date.isSame(originalDate.startOf('isoweek')), 'onUpdate action was called with start of week')
  );
  this.render(hbs`
        {{navi-date-picker
            date=date
            dateTimePeriod="week"
            onUpdate=(action onUpdate)
        }}
    `);
  // Click in the middle of the week
  await findDayElement(this, originalDate.clone().subtract(1, 'day')).click();
});

test('Selection view changes with time period', function(assert) {
  assert.expect(2);

  this.set('date', moment('2015-07-14', TEST_FORMAT));
  this.set('dateTimePeriod', 'month');
  this.render(hbs`
        {{navi-date-picker
            date=date
            dateTimePeriod=dateTimePeriod
        }}
    `);

  // Test helper functions
  let isMonthSelection = () => {
      return this.$('.datepicker-months').is(':visible') && this.$('.datepicker-days').is(':not(:visible)');
    },
    isDaySelection = () => {
      return this.$('.datepicker-days').is(':visible') && this.$('.datepicker-months').is(':not(:visible)');
    };

  assert.ok(isMonthSelection(), '"dateTimePeriod: month" uses month selection view');

  this.set('dateTimePeriod', 'week');
  assert.ok(isDaySelection(), '"dateTimePeriod: week" uses day selection view');
});

test('Selection changes with time period', function(assert) {
  assert.expect(11);

  let startDate = moment('2015-06-14', TEST_FORMAT),
    clickDate = moment('2015-06-03', TEST_FORMAT);

  this.set('date', startDate);
  this.set('dateTimePeriod', 'day');
  this.render(hbs`
        {{navi-date-picker
            date=date
            dateTimePeriod=dateTimePeriod
        }}
    `);

  /* == Day Selection == */
  assert.ok(isDayActive(this, startDate), 'Day Selection - Chosen day is selected');
  assert.ok(
    !isDayActive(this, startDate.clone().subtract(1, 'day')),
    'Day Selection - Other day in week is not selected'
  );

  /* == Week Selection == */
  this.set('dateTimePeriod', 'week');
  assert.ok(isWeekActive(this, startDate), 'Week Selection - Entire week of chosen day is selected');

  findDayElement(this, clickDate).click();
  assert.ok(!isWeekActive(this, startDate), 'Week Selection - Previous week is no longer selected');
  assert.ok(isWeekActive(this, clickDate), 'Week Selection - Newly clicked week is selected');

  /* == Month Selection == */
  this.set('dateTimePeriod', 'month');
  assert.ok(this.$('.month:contains(Jun)').is('.active'), 'Month Selection - Chosen month is active');

  /* == Back to Week Selection == */
  this.set('dateTimePeriod', 'week');
  assert.ok(isWeekActive(this, clickDate), 'Month to Week - Previously selected week remains selected');

  /* == Back to Day Selection == */
  this.set('dateTimePeriod', 'day');
  assert.ok(isDayActive(this, clickDate), 'Week to Day - Previously selected day remains selected');

  /* == Month to Day Selection == */
  this.set('dateTimePeriod', 'month');
  this.set('dateTimePeriod', 'day');
  assert.ok(isDayActive(this, clickDate), 'Month to Day - Previously selected day remains selected');

  /* == Month to Quarter Selection == */
  this.set('dateTimePeriod', 'quarter');
  next(() => {
    assert.deepEqual(
      this.$('.active-month')
        .toArray()
        .map(el => $(el).text()),
      ['Apr', 'May', 'Jun'],
      'Month to Quarter - Previously selected month is converted to its quarter'
    );
  });

  /* == Quarter to Year Selection == */
  this.set('dateTimePeriod', 'year');
  next(() => {
    assert.ok(
      this.$('.year:contains(2015)').is('.active'),
      'Month to Quarter Selection - Previously selected quarter is converted to its year'
    );
  });
});

test('Click same date twice', function(assert) {
  assert.expect(2);

  let clickDate = moment('2015-07-15', TEST_FORMAT);

  this.set('date', moment('2015-07-14', TEST_FORMAT));
  this.set('dateTimePeriod', 'week');
  this.render(hbs`
        {{navi-date-picker
            date=date
            dateTimePeriod=dateTimePeriod
        }}
    `);

  findDayElement(this, clickDate).click();
  assert.ok(isWeekActive(this, clickDate), 'Newly clicked week is selected');

  findDayElement(this, clickDate).click();
  assert.ok(isWeekActive(this, clickDate), 'Newly clicked week is still selected after clicking twice');
});

test('Start date', function(assert) {
  assert.expect(4);

  let originalEpoch = config.navi.dataEpoch,
    testEpoch = '2013-05-14';

  config.navi.dataEpoch = testEpoch;

  this.set('date', moment('2013-05-29', TEST_FORMAT));
  this.set('dateTimePeriod', 'day');
  this.render(hbs`
        {{navi-date-picker
            date=date
            dateTimePeriod=dateTimePeriod
        }}
    `);

  let epochDay = moment(testEpoch, TEST_FORMAT),
    dayBeforeEpoch = epochDay.clone().subtract(1, 'day');

  assert.ok(isDayDisabled(this, dayBeforeEpoch), 'Day Selection - Day before epoch date is not selectable');
  assert.ok(isDayEnabled(this, epochDay), 'Day Selection - Epoch date is selectable');

  /* == Week Selection == */
  this.set('dateTimePeriod', 'week');

  let startOfFirstFullWeek = epochDay
      .clone()
      .add(1, 'week')
      .subtract(1, 'day')
      .startOf('isoweek'),
    dayBeforeFirstWeek = startOfFirstFullWeek.clone().subtract(1, 'day');

  assert.ok(
    isDayDisabled(this, dayBeforeFirstWeek),
    'Week Selection - Week containing days before epoch is not selectable'
  );
  assert.ok(isDayEnabled(this, startOfFirstFullWeek), 'Week Selection - First full week after epoch is selectable');

  // Set back to original values to avoid affecting other tests
  config.navi.dataEpoch = originalEpoch;
});

/**
 * Test Helper
 * @method isDayEnabled
 * @param {Object} test - reference to test
 * @param {moment} date - day to check
 * @returns {Boolean} whether or not day is enabled on the calendar
 */
function isDayEnabled(test, date) {
  return !isDayDisabled(test, date);
}

/**
 * Test Helper
 * @method isDayDisabled
 * @param {Object} test - reference to test
 * @param {moment} date - day to check
 * @returns {Boolean} whether or not day is disabled on the calendar
 */
function isDayDisabled(test, date) {
  return findDayElement(test, date).is('.disabled');
}

/**
 * Test Helper
 * @method isDayActive
 * @param {Object} test - reference to test
 * @param {moment} date - day to check
 * @returns {Boolean} whether or not day is currently selected
 */
function isDayActive(test, date) {
  return findDayElement(test, date).is('.active');
}

/**
 * Test Helper
 * @method isWeekActive
 * @param {Object} test - reference to test
 * @param {moment} date - day to check
 * @returns {Boolean} whether or not week is currently selected
 */
function isWeekActive(test, date) {
  let dayElement = findDayElement(test, date),
    weekElement = dayElement.parent('tr');

  return weekElement.is('.active');
}

/**
 * Test Helper
 * @method findDayElement
 * @param {Object} test - reference to test
 * @param {moment} date - day to get element for
 * @returns {Object} jQuery object for calendar element for given date
 */
function findDayElement(test, date) {
  let dayString = date.format('D'),
    calendarMonthString = test.$('.datepicker-days .datepicker-switch').text(),
    calendarMonth = moment(calendarMonthString, 'MMM YYYY'),
    selector = null;

  // Determine day selector based on currently visible calendar month
  if (date.isSame(calendarMonth, 'month')) {
    // Exclude days from the previous month (marked .old) and days from the next month (marked .new)
    selector = '.day:not(.old):not(.new)';
  }
  if (date.isSame(calendarMonth.clone().subtract(1, 'month'), 'month')) {
    // Look for day in previous month
    selector = '.day.old';
  }
  if (date.isSame(calendarMonth.clone().add(1, 'month'), 'month')) {
    // Look for day in next month
    selector = '.day.new';
  }

  if (selector) {
    return test.$(selector).filter(function() {
      return $(this).text() === dayString;
    });
  } else {
    throw new Error(`Current calendar month is not in range of ${date.format()}`);
  }
}
