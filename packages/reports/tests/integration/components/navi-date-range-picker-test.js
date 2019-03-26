import { set } from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, find } from '@ember/test-helpers';
import $ from 'jquery';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';
import moment from 'moment';
import waitForError from '../../helpers/wait-for-error';

module('Integration | Component | Navi Date Range Picker', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('setInterval', () => {});
  });

  test('dateTimePeriod must be defined', async function(assert) {
    assert.expect(1);

    const [e] = await Promise.all([waitForError(), render(hbs`{{navi-date-range-picker}}`)]);

    assert.equal(
      e.message,
      'Assertion Failed: dateTimePeriod must be defined in order to use navi-date-range-picker',
      'Error is thrown when using component without a time period'
    );
  });

  test('Each look back is a predefined interval', async function(assert) {
    assert.expect(3);

    this.dateTimePeriod = 'week';

    await render(hbs`
          {{navi-date-range-picker
              dateTimePeriod=dateTimePeriod
          }}
      `);

    let ranges = findAll('.predefined-range').map(el => el.textContent.trim());

    assert.deepEqual(
      ranges,
      [
        'Current Week',
        'Last Week',
        'Last 4 Weeks',
        'Last 8 Weeks',
        'Last 13 Weeks',
        'Last 26 Weeks',
        'Last 52 Weeks',
        'Last 78 Weeks',
        'Last 104 Weeks'
      ],
      'Each date time period look back is a predefined interval'
    );

    run(() => {
      set(this, 'dateTimePeriod', 'day');
    });

    ranges = findAll('.predefined-range').map(el => el.textContent.trim());

    assert.deepEqual(
      ranges,
      [
        'Last Day',
        'Last 7 Days',
        'Last 14 Days',
        'Last 30 Days',
        'Last 60 Days',
        'Last 90 Days',
        'Last 180 Days',
        'Last 400 Days'
      ],
      'Predefined intervals update with date time period'
    );

    run(() => {
      set(this, 'dateTimePeriod', 'month');
    });

    ranges = findAll('.predefined-range').map(el => el.textContent.trim());

    assert.deepEqual(
      ranges,
      [
        'Current Month',
        'Last Month',
        'Last 3 Months',
        'Last 6 Months',
        'Last 12 Months',
        'Last 18 Months',
        'Last 24 Months'
      ],
      'Predefined intervals for month time grain are as specified'
    );
  });

  test('Selecting a predefined interval', async function(assert) {
    assert.expect(1);

    this.set('setInterval', interval => {
      let expectedInterval = new Interval(new Duration('P4W'), 'current');

      assert.ok(interval.isEqual(expectedInterval), 'Interval starts "duration" weeks ago and ends on "current"');
    });

    await render(hbs`
        {{navi-date-range-picker
            dateTimePeriod='week'
            onSetInterval=(action setInterval)
        }}
    `);

    await click(findAll('li')[2]);
  });

  test('intervalSet class', async function(assert) {
    assert.expect(2);

    await render(hbs`
          {{navi-date-range-picker
              dateTimePeriod='week'
              onSetInterval=(action (mut testInterval))
              interval=testInterval
          }}
      `);

    assert
      .dom('.navi-date-range-picker')
      .doesNotHaveClass('.interval-set', 'interval-set class is not present when the interval attr is not provided');

    await click(findAll('li')[2]);

    assert.ok(
      [...find('.navi-date-range-picker').classList].includes('interval-set'),
      'interval-set class is present when the interval attr is provided'
    );
  });

  test('Selected interval is marked active', async function(assert) {
    assert.expect(3);

    this.interval = null;

    await render(hbs`
          {{navi-date-range-picker
              dateTimePeriod='week'
              interval=interval
          }}
      `);

    assert.dom('li.active').doesNotExist('When there is no selection, no intervals are active');

    run(() => {
      this.set('interval', new Interval(new Duration('P4W'), 'current'));
    });

    assert.ok($('.navi-date-range-picker li:eq(2)').is('.active'), 'Selected interval is marked active');
    assert.dom('li.active').exists({ count: 1 }, 'Only one interval is marked active');
  });

  test('Placeholder text', async function(assert) {
    assert.expect(3);

    this.interval = null;

    await render(hbs`
      {{navi-date-range-picker
          dateTimePeriod='week'
          interval=interval
      }}
    `);

    assert
      .dom('.pick-value.selection-box')
      .hasText('Date Range', 'Placeholder text is displayed when no interval is selected');

    run(() => {
      this.set('interval', new Interval(moment('09-08-2014', 'MM-DD-YYYY'), moment('10-13-2014', 'MM-DD-YYYY')));
    });

    assert
      .dom('.pick-value label')
      .hasText('Select date range', 'Label text is displayed when an interval is selected');

    //Date Picker displays one timePeriod less than the selectionInterval
    assert
      .dom('.pick-value .value')
      .hasText('Sep 08, 2014 - Oct 12, 2014', 'Interval range is displayed when an interval is selected');
  });

  test('Custom value template', async function(assert) {
    assert.expect(3);

    this.interval = new Interval(new Duration('P7D'), 'current');

    await render(hbs`
          {{#navi-date-range-picker
              dateTimePeriod='week'
              interval=interval
              as |yieldedInterval|
          }}
              <div class='custom-template'>{{format-interval-inclusive-inclusive yieldedInterval 'day'}}</div>
          {{/navi-date-range-picker}}
      `);

    assert.dom('.custom-template').isVisible('When used in block form, a custom template is allowed');

    assert.dom('.custom-template').hasText('Last 7 Days', 'The selected interval is yielded to the custom template');

    assert.dom('.placeholder').isNotVisible('The default placeholder template is not visible');
  });

  test('Fixed range is last option', async function(assert) {
    assert.expect(1);

    await render(hbs`
      {{navi-date-range-picker
          dateTimePeriod='week'
      }}
    `);

    assert.dom(find('li:last-of-type > div')).hasText('Custom range', 'Last option is "Custom range"');
  });

  test('Open custom interval form', async function(assert) {
    assert.expect(2);

    await render(hbs`
      {{navi-date-range-picker
          dateTimePeriod='week'
          onSetInterval=(action setInterval)
      }}
    `);

    assert.dom('.custom-range-form').isNotVisible('Custom range form is hidden by default');

    await openRangePicker();
    await openCustomRange();

    assert.dom('.custom-range-form').isVisible('Clicking "Custom range" option opens up range form');
  });

  test('Custom range form shows selected interval', async function(assert) {
    assert.expect(6);

    this.interval = null;

    await render(hbs`
      {{navi-date-range-picker
          dateTimePeriod='day'
          interval=interval
      }}
    `);

    await openRangePicker();
    await openCustomRange();

    run(() => {
      this.set('interval', new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY')));
    });

    let firstActiveDate = [...this.element.querySelectorAll('.datepicker')[0].querySelectorAll('.active')].reduce(
      (acc, curr) => acc + curr.textContent.trim(),
      ''
    );
    assert.equal(firstActiveDate, '14Sep2014', 'First date picker has start day selected');

    let secondActiveDate = [...this.element.querySelectorAll('.datepicker')[1].querySelectorAll('.active')].reduce(
      (acc, curr) => acc + curr.textContent.trim(),
      ''
    );
    assert.equal(secondActiveDate, '14Oct2014', 'Second date picker has end day selected');

    //toggle advanced calendar
    await openAdvancedCalendar();

    assert
      .dom('.navi-date-input')
      .hasValue('2014-09-14', 'From text input displays start day selected in `YYYY-MM-DD` format');

    assert.equal(
      findAll('.navi-date-input')[1].value,
      '2014-10-15',
      'To text input displays end day selected in `YYYY-MM-DD` format'
    );

    run(() => {
      this.set('interval', new Interval(new Duration('P5D'), moment('10-15-2014', 'MM-DD-YYYY')));
    });

    let newFirstActiveDate = [...this.element.querySelectorAll('.datepicker')[0].querySelectorAll('.active')].reduce(
      (acc, curr) => acc + curr.textContent.trim(),
      ''
    );
    assert.equal(
      newFirstActiveDate,
      '10Oct2014',
      'First date picker has correct day selected when using a duration in the interval'
    );

    assert
      .dom('.navi-date-input')
      .hasValue('P5D', 'From text input displays the duration when using a duration in the interval');
  });

  test('Custom range is active when selection does not match another interval', async function(assert) {
    assert.expect(2);

    this.interval = new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY'));

    await render(hbs`
      {{navi-date-range-picker
          dateTimePeriod='day'
          interval=interval
      }}
    `);

    assert
      .dom('.custom-range-form .active')
      .exists('Custom range is active when selection does not match another interval');

    assert.dom('li.active').exists({ count: 1 }, 'Only one interval is marked active');
  });

  test('Custom range reset button', async function(assert) {
    assert.expect(6);

    this.interval = new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY'));

    await render(hbs`
      {{navi-date-range-picker
          dateTimePeriod='day'
          interval=interval
      }}
    `);

    // Select a new date
    await click($('.datepicker:eq(0) .day:contains(20)')[0]);
    await click($('.datepicker:eq(1) .day:contains(21)')[0]);

    let firstActiveDate = [...this.element.querySelectorAll('.datepicker')[0].querySelectorAll('.active')].reduce(
      (acc, curr) => acc + curr.textContent.trim(),
      ''
    );
    assert.equal(firstActiveDate, '20Sep2014', 'First date picker has newly selected start date');

    let secondActiveDate = [...this.element.querySelectorAll('.datepicker')[1].querySelectorAll('.active')].reduce(
      (acc, curr) => acc + curr.textContent.trim(),
      ''
    );
    assert.equal(secondActiveDate, '21Oct2014', 'Second date picker has newly selected end date');

    //toggle advanced calendar
    await openAdvancedCalendar();

    assert
      .dom('.navi-date-input')
      .hasValue('2014-09-20', 'From text input displays the changed start day in `YYYY-MM-DD` format');

    assert
      .dom(findAll('.navi-date-input')[1])
      .hasValue('2014-10-22', 'To text input displays the changed end day in `YYYY-MM-DD` format');

    // Click reset
    await click('.btn.btn-secondary');

    firstActiveDate = [...this.element.querySelectorAll('.datepicker')[0].querySelectorAll('.active')].reduce(
      (acc, curr) => acc + curr.textContent.trim(),
      ''
    );
    assert.equal(firstActiveDate, '14Sep2014', 'Clicking reset reverts to original start date');

    secondActiveDate = [...this.element.querySelectorAll('.datepicker')[1].querySelectorAll('.active')].reduce(
      (acc, curr) => acc + curr.textContent.trim(),
      ''
    );
    assert.equal(secondActiveDate, '14Oct2014', 'Clicking reset reverts to original end date');
  });

  test('Select custom interval', async function(assert) {
    assert.expect(1);

    this.interval = new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY'));

    await render(hbs`
      {{navi-date-range-picker
          dateTimePeriod='day'
          interval=interval
          onSetInterval=(action setInterval)
      }}
    `);

    // Select a new date
    await click($('.datepicker:eq(0) .day:contains(15)')[0]);
    await click($('.datepicker:eq(1) .day:contains(16)')[0]);

    this.set('setInterval', interval => {
      let selectedStart = moment('09-15-2014', 'MM-DD-YYYY'),
        selectedEnd = moment('10-16-2014', 'MM-DD-YYYY');

      assert.ok(
        interval.isEqual(new Interval(selectedStart, selectedEnd.add(1, 'day'))),
        'Interval comes from date picker and end date is one more than selected'
      );
    });

    // Click apply
    await click('.btn.btn-primary');
  });

  test('Select date for the next day', async function(assert) {
    assert.expect(1);

    this.interval = new Interval(moment('04-01-2019', 'MM-DD-YYYY'), moment('04-03-2019', 'MM-DD-YYYY'));

    await render(hbs`
      {{navi-date-range-picker
        dateTimePeriod='day'
        interval=interval
        onSetInterval=(action setInterval)
      }}
    `);

    // Select first date after new selected date
    await click($('.datepicker:eq(1) td.day:not(.old):contains(3):eq(0)')[0]);
    this.set('setInterval', interval => {
      let selectedStart = moment('04-01-2019', 'MM-DD-YYYY'),
        selectedEnd = moment('04-03-2019', 'MM-DD-YYYY');

      assert.ok(
        interval.isEqual(new Interval(selectedStart, selectedEnd.add(1, 'day'))),
        'Interval comes from date picker and end date is one more than selected'
      );
    });

    // Click apply
    await click('.btn.btn-primary');
  });

  /* == Calendar Bug - Date increments on apply == */
  test('Custom Range Date doesn`t increment on apply', async function(assert) {
    assert.expect(2);

    this.interval = new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY'));

    let expectedInterval = new Interval(moment('09-15-2014', 'MM-DD-YYYY'), moment('10-17-2014', 'MM-DD-YYYY'));

    await render(hbs`
        {{navi-date-range-picker
            interval=interval
            dateTimePeriod='day'
            onSetInterval=(action setInterval)
        }}
    `);

    // Select a new date
    await click($('.datepicker:eq(0) .day:contains(15)')[0]);
    await click($('.datepicker:eq(1) .day:contains(16)')[0]);

    this.set('setInterval', interval => {
      this.set('interval', interval);
      assert.ok(interval.isEqual(expectedInterval), 'Interval comes from first datepicker');
    });

    await click('.btn.btn-primary');
    await click('.btn.btn-primary');
  });

  test('Editing custom interval - string', async function(assert) {
    assert.expect(1);

    this.interval = new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY'));
    this.set('setInterval', interval => {
      let selectedStart = moment('10-15-2014', 'MM-DD-YYYY'),
        selectedEnd = moment('10-25-2014', 'MM-DD-YYYY');

      assert.ok(interval.isEqual(new Interval(selectedStart, selectedEnd)), 'Interval comes from date inputs');
    });

    await render(hbs`
      {{navi-date-range-picker
          dateTimePeriod='day'
          interval=interval
          onSetInterval=(action setInterval)
      }}
    `);

    //toggle advanced calendar
    await openRangePicker();
    await openCustomRange();
    await openAdvancedCalendar();

    /**
     * Set a new date and blur input to trigger change
     * Explicitly using Jquery because the ember-test-helpers functions were not working properly for this test
     */
    $('.navi-date-range-picker__start-input').val('2014-10-15');
    $('.navi-date-range-picker__start-input').blur();
    $('.navi-date-range-picker__end-input').val('2014-10-25');
    $('.navi-date-range-picker__end-input').blur();

    // Click apply
    await click('.navi-date-range-picker__apply-btn');
  });

  test('Editing custom interval - macros', async function(assert) {
    assert.expect(2);

    this.interval = new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY'));

    await render(hbs`
      {{navi-date-range-picker
          dateTimePeriod='day'
          interval=interval
          onSetInterval=(action setInterval)
      }}
    `);

    //toggle advanced calendar
    await openRangePicker();
    await openCustomRange();
    await openAdvancedCalendar();

    /**
     * Set a new date and blur input to trigger change
     * Explicitly using Jquery because the ember-test-helpers functions were not working properly for this test
     */
    $('.navi-date-range-picker__start-input').val('P7D');
    $('.navi-date-range-picker__start-input').blur();
    $('.navi-date-range-picker__end-input').val('current');
    $('.navi-date-range-picker__end-input').blur();

    this.set('setInterval', interval => {
      assert.equal(
        interval._start.toString(),
        'P7D',
        'Interval start is a duration object with the duration entered in the input'
      );

      assert.equal(interval._end.toString(), 'current', 'Interval end is the macro `next` as enterd in the input');
    });

    // Click apply
    await click('.btn.btn-primary');
  });

  test('Default interval for timegrains', async function(assert) {
    assert.expect(4);

    // set dateTimePeriod to day
    this.dateTimePeriod = 'day';

    await render(hbs`
        {{navi-date-range-picker
            dateTimePeriod=dateTimePeriod
            onSetInterval=(action setInterval)
        }}
    `);

    // Click the Custom range and click apply
    await openRangePicker();
    await openCustomRange();

    this.set('setInterval', interval => {
      let expectedInterval = new Interval(new Duration('P1D'), 'current');
      assert.ok(interval.isEqual(expectedInterval), 'Day timegrain defaults to last one day');
    });

    await click('.btn.btn-primary');

    // set dateTimePeriod to week
    run(() => {
      set(this, 'dateTimePeriod', 'week');
    });

    this.set('setInterval', interval => {
      let expectedInterval = new Interval(new Duration('P1W'), 'current');
      assert.ok(interval.isEqual(expectedInterval), 'Week timegrain defaults to last one week');
    });

    await click('.btn.btn-primary');

    // set dateTimePeriod to month
    run(() => {
      set(this, 'dateTimePeriod', 'month');
    });

    this.set('setInterval', interval => {
      let expectedInterval = new Interval(new Duration('P1M'), 'current');
      assert.ok(interval.isEqual(expectedInterval), 'Month timegrain defaults to last one month');
    });

    await click('.btn.btn-primary');

    // set dateTimePeriod to quarter
    run(() => {
      set(this, 'dateTimePeriod', 'quarter');
    });

    this.set('setInterval', interval => {
      let expectedInterval = new Interval(new Duration('P3M'), 'current');
      assert.ok(interval.isEqual(expectedInterval), 'Quarter timegrain defaults to last three month');
    });

    await click('.btn.btn-primary');
  });

  test('Default interval for `All` timegrain', async function(assert) {
    assert.expect(3);

    this.dateTimePeriod = 'all';

    await render(hbs`
        {{navi-date-range-picker
            dateTimePeriod=dateTimePeriod
            onSetInterval=(action setInterval)
        }}
    `);

    assert.dom('li').exists({ count: 1 }, 'Only one option is available to select for All time grain');

    assert.dom(find('li:last-of-type > div')).hasText('Custom range', 'Last option is "Custom range"');

    // Click the Custom range and click apply
    await openRangePicker();
    await openCustomRange();

    this.set('setInterval', interval => {
      let expectedInterval = new Interval(new Duration('P7D'), 'current');

      assert.ok(interval.isEqual(expectedInterval), 'All timegrain defaults to last seven days');
    });

    await click('.btn.btn-primary');
  });

  async function openRangePicker() {
    await click('.navi-date-range-picker > .pick-container > .pick-value');
  }

  async function openCustomRange() {
    await click('.custom-range-form .pick-value');
  }

  async function openAdvancedCalendar() {
    await click('.navi-date-range-picker__advanced-calendar-toggle');
  }
});
