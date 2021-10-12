import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import config from 'ember-get-config';

const TEST_FORMAT = 'YYYY-MM-DD';

const TEMPLATE = hbs`<NaviDatePicker
  @date={{this.date}}
  @minDate={{this.minDate}}
  @maxDate={{this.maxDate}}
  @dateTimePeriod={{this.dateTimePeriod}}
  @onUpdate={{this.onUpdate}}
/>`;

module('Integration | Component | Navi Date Picker', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('dateTimePeriod', 'day');
    this.set('onUpdate', () => undefined);
  });

  test('Select date', async function (assert) {
    assert.expect(7);

    this.set('date', moment.utc('2015-07-14', TEST_FORMAT));

    await render(TEMPLATE);

    assert.dom('.ember-power-calendar-day--selected').hasText('14', 'The active day is based on the given date');

    assert
      .dom(find('.ember-power-calendar-nav-title > span:nth-of-type(1) > select').selectedOptions[0])
      .hasText('July', 'The active month is based on the given date');

    assert
      .dom(find('.ember-power-calendar-nav-title > span:nth-of-type(2) > select').selectedOptions[0])
      .hasText('2015', 'The active year is based on the given date');

    /* == Update date after creation == */
    this.set('date', moment.utc('2015-06-17', TEST_FORMAT));

    assert.dom('.ember-power-calendar-day--selected').hasText('17', 'The active day is based on the new given date');

    assert
      .dom(find('.ember-power-calendar-nav-title > span:nth-of-type(1) > select').selectedOptions[0])
      .hasText('June', 'The active month is based on the given date');

    assert
      .dom(find('.ember-power-calendar-nav-title > span:nth-of-type(2) > select').selectedOptions[0])
      .hasText('2015', 'The active year is based on the given date');

    /* == Date outside of range == */
    this.set('date', moment.utc('2050-06-17', TEST_FORMAT));

    assert
      .dom('.ember-power-calendar-day--selected')
      .exists({ count: 1 }, 'No date, even a future date is out of range');
  });

  test('Change date through calendar, then through attr', async function (assert) {
    assert.expect(3);

    let originalDate = moment.utc('2015-07-14', TEST_FORMAT),
      clickDate = moment.utc('2015-07-18', TEST_FORMAT),
      boundDate = moment.utc('2015-07-12', TEST_FORMAT);

    this.set('date', originalDate);

    await render(TEMPLATE);

    // Test clicking on a different date
    await click(dayElementSelector(clickDate));

    assert.ok(isDayActive(clickDate), 'Clicked date is visibly selected');

    // Change date back through binding
    this.set('date', boundDate);

    assert.ok(isDayActive(boundDate), 'Bound date is visibly selected');
    assert.ok(!isDayActive(clickDate), 'Clicked date is no longer selected');
  });

  test('Change center date - hour', async function (assert) {
    assert.expect(4);

    this.set('date', moment.utc('2015-07-14', TEST_FORMAT));
    this.set('dateTimePeriod', 'hour');

    await render(TEMPLATE);

    assert.equal(getMonth(), 'July', 'The center date starts as the passed in month');
    await clickPrevious();
    assert.equal(getMonth(), 'June', 'The center date changes to previous month');
    await clickNext();
    assert.equal(getMonth(), 'July', 'The center date goes back to original month');
    await clickNext();
    assert.equal(getMonth(), 'August', 'The center date goes one month ahead of original');
  });

  test('Change center date - day', async function (assert) {
    assert.expect(4);

    this.set('date', moment.utc('2015-07-14', TEST_FORMAT));
    this.set('dateTimePeriod', 'day');

    await render(TEMPLATE);

    assert.equal(getMonth(), 'July', 'The center date starts as the passed in month');
    await clickPrevious();
    assert.equal(getMonth(), 'June', 'The center date changes to previous month');
    await clickNext();
    assert.equal(getMonth(), 'July', 'The center date goes back to original month');
    await clickNext();
    assert.equal(getMonth(), 'August', 'The center date goes one month ahead of original');
  });

  test('Change center date - week', async function (assert) {
    assert.expect(4);

    this.set('date', moment.utc('2015-07-14', TEST_FORMAT));
    this.set('dateTimePeriod', 'isoWeek');

    await render(TEMPLATE);

    assert.equal(getMonth(), 'July', 'The center date starts as the passed in month');
    await clickPrevious();
    assert.equal(getMonth(), 'June', 'The center date changes to previous month');
    await clickNext();
    assert.equal(getMonth(), 'July', 'The center date goes back to original month');
    await clickNext();
    assert.equal(getMonth(), 'August', 'The center date goes one month ahead of original');
  });

  test('Change center date - month', async function (assert) {
    assert.expect(4);

    this.set('date', moment.utc('2015-07-01', TEST_FORMAT));
    this.set('dateTimePeriod', 'month');

    await render(TEMPLATE);

    assert
      .dom('.ember-power-calendar-selector-nav-title')
      .hasText('2015', 'The center date starts as the passed in year');
    await clickPrevious();
    assert.dom('.ember-power-calendar-selector-nav-title').hasText('2014', 'The center date changes to previous year');
    await clickNext();
    assert
      .dom('.ember-power-calendar-selector-nav-title')
      .hasText('2015', 'The center date goes back to original year');
    await clickNext();
    assert
      .dom('.ember-power-calendar-selector-nav-title')
      .hasText('2016', 'The center date goes one year ahead of original');
  });

  test('Change center date - quarter', async function (assert) {
    assert.expect(4);

    this.set('date', moment.utc('2015-07-14', TEST_FORMAT));
    this.set('dateTimePeriod', 'quarter');

    await render(TEMPLATE);

    assert
      .dom('.ember-power-calendar-selector-nav-title')
      .hasText('2015', 'The center date starts as the passed in year');
    await clickPrevious();
    assert.dom('.ember-power-calendar-selector-nav-title').hasText('2014', 'The center date changes to previous year');
    await clickNext();
    assert
      .dom('.ember-power-calendar-selector-nav-title')
      .hasText('2015', 'The center date goes back to original year');
    await clickNext();
    assert
      .dom('.ember-power-calendar-selector-nav-title')
      .hasText('2016', 'The center date goes one year ahead of original');
  });

  test('Change center date - year', async function (assert) {
    assert.expect(4);

    this.set('date', moment.utc('2015-07-14', TEST_FORMAT));
    this.set('dateTimePeriod', 'year');

    await render(TEMPLATE);

    assert
      .dom('.ember-power-calendar-selector-nav-title')
      .hasText(`2010's`, 'The center date starts as the passed in decade');
    await clickPrevious();
    assert
      .dom('.ember-power-calendar-selector-nav-title')
      .hasText(`2000's`, 'The center date changes to previous decade');
    await clickNext();
    assert
      .dom('.ember-power-calendar-selector-nav-title')
      .hasText(`2010's`, 'The center date goes back to original decade');
    await clickNext();
    assert
      .dom('.ember-power-calendar-selector-nav-title')
      .hasText(`2020's`, 'The center date goes one decade ahead of original');
  });

  test('Change center date through select', async function (assert) {
    this.set('date', moment.utc('2015-07-14', TEST_FORMAT));

    await render(TEMPLATE);

    // change month
    assert.equal(getMonth(), 'July', 'The center date starts as the passed in date');

    const monthSelect = getMonthSelect();
    monthSelect.selectedIndex = monthSelect.selectedIndex - 1;
    await triggerEvent(monthSelect, 'change');

    assert.equal(getMonth(), 'June', 'The center date changes to previous month');

    // change year
    assert.equal(getYear(), '2015', 'The center date year starts as the passed in date');

    let yearSelect = getYearSelect();
    yearSelect.selectedIndex = yearSelect.selectedIndex + 1;
    await triggerEvent(yearSelect, 'change');

    assert.equal(getYear(), '2016', 'The center date changes to next year');
    assert.equal(getMonth(), 'June', 'The center month does not change');

    this.set('minDate', moment.utc('2014-11-14', TEST_FORMAT));
    this.set('maxDate', moment.utc('2017-02-14', TEST_FORMAT));

    yearSelect = getYearSelect();
    yearSelect.selectedIndex = yearSelect.selectedIndex - 2;
    await triggerEvent(yearSelect, 'change');

    assert.equal(getYear(), '2014', 'The center date changes to next year');
    assert.equal(getMonth(), 'November', 'The center month changes to month of min date');

    yearSelect = getYearSelect();
    yearSelect.selectedIndex = yearSelect.selectedIndex + 3;
    await triggerEvent(yearSelect, 'change');

    assert.equal(getYear(), '2017', 'The center date changes to next year');
    assert.equal(getMonth(), 'February', 'The center month changes to month of max date');
  });

  test('Change date action', async function (assert) {
    assert.expect(3);

    const originalDate = moment.utc('2015-07-14', TEST_FORMAT);
    const newDate = moment.utc('2015-07-18', TEST_FORMAT);

    this.set('date', originalDate);
    this.set('onUpdate', (date) => {
      assert.ok(date.isSame(newDate), 'onUpdate action was called with new date');
      this.set('date', date);
    });
    await render(TEMPLATE);

    // Test clicking on a different date
    await click(dayElementSelector(newDate));

    assert.ok(isDayActive(newDate), 'New date is visibly selected regardless of action being handled');
    assert.ok(!isDayActive(originalDate), 'Original date is no longer selected');

    /*
     * Check that changing `date` to the date suggested by the action does not
     * trigger the action again, causing a cycle
     */
    this.set('onUpdate', () => {
      throw new Error('Action was incorrectly called');
    });
    this.set('date', newDate);

    // Check that clicking on already selected date does not trigger action again
    await click(dayElementSelector(newDate));
  });

  test('Change date action always gives start of time period', async function (assert) {
    assert.expect(1);

    let originalDate = moment.utc('2015-07-14', TEST_FORMAT);

    this.set('date', originalDate);
    this.set('dateTimePeriod', 'isoWeek');
    this.set('onUpdate', (date) =>
      assert.ok(date.isSame(originalDate.startOf('isoweek')), 'onUpdate action was called with start of week')
    );
    await render(TEMPLATE);
    // Click in the middle of the week
    await click(dayElementSelector(originalDate.clone().subtract(1, 'day')));
  });

  test('Selection view changes with time period', async function (assert) {
    assert.expect(9);

    this.set('date', moment.utc('2015-07-14', TEST_FORMAT));
    this.set('dateTimePeriod', 'month');
    await render(TEMPLATE);

    assert.dom('.ember-power-calendar-selector-months').exists('"dateTimePeriod: month" uses month view');
    assert.dom('.ember-power-calendar-days').doesNotExist('"dateTimePeriod: month" does not use day view');
    assert.dom('.ember-power-calendar-selector-years').doesNotExist('"dateTimePeriod: month" does not use year view');

    this.set('dateTimePeriod', 'isoWeek');
    assert.dom('.ember-power-calendar-days').exists('"dateTimePeriod: week" uses day view');
    assert.dom('.ember-power-calendar-selector-months').doesNotExist('"dateTimePeriod: week" does not use month view');
    assert.dom('.ember-power-calendar-selector-years').doesNotExist('"dateTimePeriod: week" does not use year view');

    this.set('dateTimePeriod', 'year');
    assert.dom('.ember-power-calendar-selector-years').exists('"dateTimePeriod: year" uses year view');
    assert.dom('.ember-power-calendar-selector-months').doesNotExist('"dateTimePeriod: year" does not use month view');
    assert.dom('.ember-power-calendar-days').doesNotExist('"dateTimePeriod: year" does not use day view');
  });

  test('Selection changes with time period', async function (assert) {
    assert.expect(10);

    let startDate = moment.utc('2015-06-14', TEST_FORMAT),
      clickDate = moment.utc('2015-06-03', TEST_FORMAT);

    this.set('date', startDate);
    this.set('dateTimePeriod', 'day');
    await render(TEMPLATE);

    /* == Hour Selection == */
    this.set('dateTimePeriod', 'hour');

    assert.ok(isDayActive(startDate), 'Hour Selection - Chosen day is selected');
    assert.ok(!isDayActive(startDate.clone().subtract(1, 'day')), 'Hour Selection - Other day in week is not selected');

    /* == Day Selection == */
    assert.ok(isDayActive(startDate), 'Day Selection - Chosen day is selected');
    assert.ok(!isDayActive(startDate.clone().subtract(1, 'day')), 'Day Selection - Other day in week is not selected');

    /* == Week Selection == */
    this.set('dateTimePeriod', 'isoWeek');

    assert.ok(isWeekActive(startDate), 'Week Selection - Entire week of chosen day is selected');

    await click(dayElementSelector(clickDate));
    assert.ok(!isWeekActive(startDate), 'Week Selection - Previous week is no longer selected');
    assert.ok(isWeekActive(clickDate), 'Week Selection - Newly clicked week is selected');

    /* == Month Selection == */
    this.set('dateTimePeriod', 'month');
    assert
      .dom('.ember-power-calendar-selector-month--selected')
      .hasText('Jun', 'Month Selection - Chosen month is active');

    /* == Month to Quarter Selection == */
    this.set('dateTimePeriod', 'quarter');
    assert
      .dom('.ember-power-calendar-selector-quarter--selected')
      .hasText('Q2', 'Month to Quarter - Previously selected month is converted to its quarter');

    /* == Quarter to Year Selection == */
    this.set('dateTimePeriod', 'year');
    assert
      .dom('.ember-power-calendar-selector-year--selected')
      .hasText('2015', 'Month to Quarter Selection - Previously selected quarter is converted to its year');
  });

  test('Click same date twice', async function (assert) {
    assert.expect(2);

    let clickDate = moment.utc('2015-07-15', TEST_FORMAT);

    this.set('date', moment.utc('2015-07-14', TEST_FORMAT));
    this.set('dateTimePeriod', 'isoWeek');
    await render(TEMPLATE);

    await click(dayElementSelector(clickDate));
    assert.ok(isWeekActive(clickDate), 'Newly clicked week is selected');

    await click(dayElementSelector(clickDate));
    assert.ok(isWeekActive(clickDate), 'Newly clicked week is still selected after clicking twice');
  });

  test('Start date', async function (assert) {
    assert.expect(4);

    let originalEpoch = config.navi.dataEpoch,
      testEpoch = '2013-05-14';

    config.navi.dataEpoch = testEpoch;

    this.set('date', moment.utc('2013-05-29', TEST_FORMAT));
    this.set('dateTimePeriod', 'day');
    await render(TEMPLATE);

    let epochDay = moment.utc(testEpoch, TEST_FORMAT),
      dayBeforeEpoch = epochDay.clone().subtract(1, 'day');

    assert.ok(isDayDisabled(dayBeforeEpoch), 'Day Selection - Day before epoch date is not selectable');
    assert.ok(isDayEnabled(epochDay), 'Day Selection - Epoch date is selectable');

    /* == IsoWeek Selection == */
    this.set('dateTimePeriod', 'isoWeek');

    let startOfFirstFullWeek = epochDay.clone().add(1, 'isoWeek').subtract(1, 'day').startOf('isoWeek'),
      dayBeforeFirstWeek = startOfFirstFullWeek.clone().subtract(1, 'day');

    assert.ok(
      isDayDisabled(dayBeforeFirstWeek),
      'Week Selection - Week containing days before epoch is not selectable'
    );
    assert.ok(isDayEnabled(startOfFirstFullWeek), 'Week Selection - First full week after epoch is selectable');

    // Set back to original values to avoid affecting other tests
    config.navi.dataEpoch = originalEpoch;
  });

  test('Min and max date', async function (assert) {
    assert.expect(7);

    let originalEpoch = config.navi.dataEpoch,
      testEpoch = '2013-05-14';

    config.navi.dataEpoch = testEpoch;

    const minDay = moment.utc('2013-05-07', TEST_FORMAT),
      dayBeforeMin = minDay.clone().subtract(1, 'day'),
      maxDay = moment.utc('2013-05-28', TEST_FORMAT),
      dayAfterMax = maxDay.clone().add(1, 'day'),
      epochDay = moment.utc(testEpoch, TEST_FORMAT);

    this.set('date', moment.utc('2013-05-23', TEST_FORMAT));
    this.set('minDate', minDay);
    this.set('maxDate', maxDay);
    this.set('dateTimePeriod', 'day');
    await render(TEMPLATE);

    assert.ok(isDayDisabled(dayBeforeMin), 'Day Selection - Day before min date is not selectable');
    assert.ok(isDayDisabled(dayAfterMax), 'Day Selection - Day after max date is not selectable');
    assert.ok(isDayEnabled(epochDay), 'Day Selection - Epoch date is selectable');

    /* == IsoWeek Selection == */
    this.set('dateTimePeriod', 'isoWeek');

    const startOfFirstFullWeek = minDay.clone().add(1, 'isoWeek').subtract(1, 'day').startOf('isoWeek'),
      dayBeforeFirstWeek = startOfFirstFullWeek.clone().subtract(1, 'day'),
      endOfLastFullWeek = maxDay.clone().subtract(1, 'isoWeek').add(1, 'day').endOf('isoWeek'),
      dayAfterLastWeek = endOfLastFullWeek.clone().add(1, 'day');

    assert.ok(
      isDayDisabled(dayBeforeFirstWeek),
      'Week Selection - Week containing days before min date is not selectable'
    );
    assert.ok(isDayEnabled(startOfFirstFullWeek), 'Week Selection - First full week after min date is selectable');
    assert.ok(
      isDayDisabled(dayAfterLastWeek),
      'Week Selection - Week containing days after max date is not selectable'
    );
    assert.ok(isDayEnabled(endOfLastFullWeek), 'Week Selection - First full week before max date is selectable');

    // Set back to original values to avoid affecting other tests
    config.navi.dataEpoch = originalEpoch;
  });

  test('Year select', async function (assert) {
    this.set('date', moment.utc('2021-04-22', TEST_FORMAT));
    this.set('minDate', moment.utc('2019-12-31', TEST_FORMAT));
    this.set('maxDate', moment.utc('2023-05-29', TEST_FORMAT));
    this.set('dateTimePeriod', 'day');
    await render(TEMPLATE);
    assert.deepEqual(
      getYearSelectOptions(),
      ['2019', '2020', '2021', '2022', '2023'],
      'year select has correct options for `day` grain'
    );

    this.set('dateTimePeriod', 'week');
    assert.deepEqual(
      getYearSelectOptions(),
      ['2020', '2021', '2022', '2023'],
      'year select has correct options for `week` grain'
    );

    this.set('minDate', moment.utc('2021-01-31', TEST_FORMAT));
    this.set('maxDate', moment.utc('2021-05-29', TEST_FORMAT));
    assert.deepEqual(getYearSelectOptions(), ['2021'], 'year select has only one option when min year = max year');
  });

  test('Month select', async function (assert) {
    this.set('date', moment.utc('2021-01-22', TEST_FORMAT));
    this.set('minDate', moment.utc('2019-12-31', TEST_FORMAT));
    this.set('maxDate', moment.utc('2023-05-29', TEST_FORMAT));
    this.set('dateTimePeriod', 'day');
    await render(TEMPLATE);
    assert.deepEqual(getMonthSelectOptions(), moment.months(), 'month select options include all months');

    this.set('minDate', moment.utc('2021-03-31', TEST_FORMAT));
    this.set('maxDate', moment.utc('2021-05-29', TEST_FORMAT));
    assert.deepEqual(
      getMonthSelectOptions(),
      ['March', 'April', 'May'],
      'month select has correct options when min year = max year'
    );

    this.set('minDate', moment.utc('2020-11-30', TEST_FORMAT));
    this.set('maxDate', moment.utc('2021-02-22', TEST_FORMAT));
    assert.deepEqual(
      getMonthSelectOptions(),
      ['January', 'February'],
      'month select has correct options for the selected year'
    );

    let yearSelect = getYearSelect();
    yearSelect.selectedIndex = 0;
    await triggerEvent(yearSelect, 'change');
    assert.deepEqual(
      getMonthSelectOptions(),
      ['November', 'December'],
      'month select has correct options for the previous year'
    );

    this.set('dateTimePeriod', 'week');
    yearSelect = getYearSelect();
    yearSelect.selectedIndex = 0;
    await triggerEvent(yearSelect, 'change');
    assert.deepEqual(getMonthSelectOptions(), ['December'], 'month select has correct options for `week` grain');
  });

  const getOptionsArray = (select) => Array.from(select.options).map((option) => option.value);
  const getMonthSelect = () => find('.ember-power-calendar-nav-title .with-invisible-select > select');
  const getMonthSelectOptions = () => getOptionsArray(getMonthSelect());
  const getMonth = () => find('.ember-power-calendar-nav-title > span').childNodes[2].textContent;
  const getYearSelect = () => find('.ember-power-calendar-nav-title .with-invisible-select:nth-of-type(2) > select');
  const getYearSelectOptions = () => getOptionsArray(getYearSelect());
  const getYear = () => find('.ember-power-calendar-nav-title > span:nth-of-type(2)').childNodes[2].textContent;

  /**
   * Test Helper
   * @method clickPrevious
   * @returns {Promise} a click event to the previous button in the nav
   */
  function clickPrevious() {
    return click(
      find('.ember-power-calendar-nav-control--previous') ||
        find('.ember-power-calendar-selector-nav-control--previous')
    );
  }

  /**
   * Test Helper
   * @method clickNext
   * @returns {Promise} a click event to the next button in the nav
   */
  function clickNext() {
    return click(
      find('.ember-power-calendar-nav-control--next') || find('.ember-power-calendar-selector-nav-control--next')
    );
  }

  /**
   * Test Helper
   * @method isDayEnabled
   * @param {moment} date - day to check
   * @returns {Boolean} whether or not day is enabled on the calendar
   */
  function isDayEnabled(date) {
    return !isDayDisabled(date);
  }

  /**
   * Test Helper
   * @method isDayDisabled
   * @param {moment} date - day to check
   * @returns {Boolean} whether or not day is disabled on the calendar
   */
  function isDayDisabled(date) {
    return find(dayElementSelector(date)).disabled;
  }

  /**
   * Test Helper
   * @method isDayActive
   * @param {moment} date - day to check
   * @returns {Boolean} whether or not day is currently selected
   */
  function isDayActive(date) {
    const activeClasses = find(dayElementSelector(date)).classList;
    return activeClasses.contains('ember-power-calendar-day--selected');
  }

  /**
   * Test Helper
   * @method isWeekActive
   * @param {moment} date - day to check
   * @returns {Boolean} whether or not week is currently selected
   */
  function isWeekActive(date) {
    let dayElement = find(dayElementSelector(date)),
      weekElement = dayElement.parentElement,
      dayGrid = weekElement.parentElement;

    const selectedTest = '.ember-power-calendar-day--selected';
    const weekSelected = weekElement.querySelectorAll(selectedTest).length === 7;
    const totalSelected = dayGrid.querySelectorAll(selectedTest).length;

    return weekSelected && totalSelected === 7;
  }

  /**
   * Test Helper
   * @method dayElementSelector
   * @param {Moment} date - day to get element for
   * @returns {String} element selector for the given date
   */
  function dayElementSelector(date) {
    return `.ember-power-calendar-day[data-date="${date.format('YYYY-MM-DD')}"]`;
  }
});
