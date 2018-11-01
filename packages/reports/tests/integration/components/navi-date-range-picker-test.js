import { moduleForComponent, test } from 'ember-qunit';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';
import moment from 'moment';
import Ember from 'ember';

moduleForComponent('navi-date-range-picker', 'Integration | Component | Navi Date Range Picker', {
  integration: true,
  beforeEach() {
    this.set('setInterval', () => {});
  }
});

test('dateTimePeriod must be defined', function(assert) {
  assert.expect(1);

  assert.expectAssertion(
    () => {
      this.render('{{navi-date-range-picker}}');
    },
    /Assertion Failed: dateTimePeriod must be defined in order to use navi-date-range-picker/,
    'Error is thrown when using component without a time period'
  );
});

test('Each look back is a predefined interval', function(assert) {
  assert.expect(3);

  this.dateTimePeriod = 'week';

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod=dateTimePeriod
        }}
    `);

  let ranges = this.$('.predefined-range')
    .map(function() {
      return $(this)
        .text()
        .trim();
    })
    .get();

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

  Ember.run(() => {
    Ember.set(this, 'dateTimePeriod', 'day');
  });

  ranges = this.$('.predefined-range')
    .map(function() {
      return $(this)
        .text()
        .trim();
    })
    .get();

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

  Ember.run(() => {
    Ember.set(this, 'dateTimePeriod', 'month');
  });

  ranges = this.$('.predefined-range')
    .map(function() {
      return $(this)
        .text()
        .trim();
    })
    .get();

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

test('Selecting a predefined interval', function(assert) {
  assert.expect(1);

  this.set('setInterval', interval => {
    let expectedInterval = new Interval(new Duration('P4W'), 'current');

    assert.ok(interval.isEqual(expectedInterval), 'Interval starts "duration" weeks ago and ends on "current"');
  });

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod='week'
            setInterval=(action setInterval)
        }}
    `);

  Ember.run(() => {
    this.$('li:eq(2)').click();
  });
});

test('intervalSet class', function(assert) {
  assert.expect(2);

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod='week'
            setInterval=(action (mut testInterval))
            interval=testInterval
        }}
    `);

  assert.ok(
    this.$('.navi-date-range-picker').not('.interval-set'),
    'interval-set class is not present when the interval attr is not provided'
  );

  Ember.run(() => {
    this.$('li:eq(2)').click();
  });

  assert.ok(
    this.$('.navi-date-range-picker').is('.interval-set'),
    'interval-set class is present when the interval attr is provided'
  );
});

test('Selected interval is marked active', function(assert) {
  assert.expect(3);

  this.interval = null;

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod='week'
            interval=interval
        }}
    `);

  assert.equal(this.$('li.active').length, 0, 'When there is no selection, no intervals are active');

  Ember.run(() => {
    this.set('interval', new Interval(new Duration('P4W'), 'current'));
  });

  assert.ok(this.$('li:eq(2)').is('.active'), 'Selected interval is marked active');
  assert.equal(this.$('li.active').length, 1, 'Only one interval is marked active');
});

test('Placeholder text', function(assert) {
  assert.expect(3);

  this.interval = null;

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod='week'
            interval=interval
        }}
    `);

  assert.equal(
    this.$('.pick-value.selection-box')
      .text()
      .trim(),
    'Date Range',
    'Placeholder text is displayed when no interval is selected'
  );

  Ember.run(() => {
    this.set('interval', new Interval(moment('09-08-2014', 'MM-DD-YYYY'), moment('10-13-2014', 'MM-DD-YYYY')));
  });

  assert.equal(
    this.$('.pick-value label')
      .text()
      .trim(),
    'Select date range',
    'Label text is displayed when an interval is selected'
  );

  //Date Picker displays one timePeriod less than the selectionInterval
  assert.equal(
    this.$('.pick-value .value')
      .text()
      .trim(),
    'Sep 08, 2014 - Oct 12, 2014',
    'Interval range is displayed when an interval is selected'
  );
});

test('Custom value template', function(assert) {
  assert.expect(3);

  this.interval = new Interval(new Duration('P7D'), 'current');

  this.render(`
        {{#navi-date-range-picker
            dateTimePeriod='week'
            interval=interval
            as |yieldedInterval|
        }}
            <div class='custom-template'>{{format-interval-inclusive-inclusive yieldedInterval 'day'}}</div>
        {{/navi-date-range-picker}}
    `);

  assert.ok(this.$('.custom-template').is(':visible'), 'When used in block form, a custom template is allowed');

  assert.equal(
    this.$('.custom-template')
      .text()
      .trim(),
    'Last 7 Days',
    'The selected interval is yielded to the custom template'
  );

  assert.notOk(this.$('.placeholder').is(':visible'), 'The default placeholder template is not visible');
});

test('Fixed range is last option', function(assert) {
  assert.expect(1);

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod='week'
        }}
    `);

  assert.equal(
    this.$('li:last-of-type > div:eq(0)')
      .text()
      .trim(),
    'Custom range',
    'Last option is "Custom range"'
  );
});

test('Open custom interval form', function(assert) {
  assert.expect(2);

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod='week'
            setInterval=(action setInterval)
        }}
    `);

  assert.ok(this.$('.custom-range-form').is(':not(:visible)'), 'Custom range form is hidden by default');

  Ember.run(() => {
    openRangePicker(this);
    openCustomRange(this);
  });

  assert.ok(this.$('.custom-range-form').is(':visible'), 'Clicking "Custom range" option opens up range form');
});

test('Custom range form shows selected interval', function(assert) {
  assert.expect(6);

  this.interval = null;

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod='day'
            interval=interval
        }}
    `);

  Ember.run(() => {
    openRangePicker(this);
    openCustomRange(this);
  });

  Ember.run(() => {
    this.set('interval', new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY')));
  });

  assert.equal(this.$('.datepicker:eq(0) .active').text(), '14Sep2014', 'First date picker has start day selected');

  assert.equal(this.$('.datepicker:eq(1) .active').text(), '14Oct2014', 'Second date picker has end day selected');

  //toggle advanced calendar
  Ember.run(() => openAdvancedCalendar(this));

  assert.equal(
    this.$('.navi-date-input')[0].value,
    '2014-09-14',
    'From text input displays start day selected in `YYYY-MM-DD` format'
  );

  assert.equal(
    this.$('.navi-date-input')[1].value,
    '2014-10-15',
    'To text input displays end day selected in `YYYY-MM-DD` format'
  );

  Ember.run(() => {
    this.set('interval', new Interval(new Duration('P5D'), moment('10-15-2014', 'MM-DD-YYYY')));
  });

  assert.equal(
    this.$('.datepicker:eq(0) .active').text(),
    '10Oct2014',
    'First date picker has correct day selected when using a duration in the interval'
  );

  assert.equal(
    this.$('.navi-date-input')[0].value,
    'P5D',
    'From text input displays the duration when using a duration in the interval'
  );
});

test('Custom range is active when selection does not match another interval', function(assert) {
  assert.expect(2);

  this.interval = new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY'));

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod='day'
            interval=interval
        }}
    `);

  assert.ok(
    this.$('.custom-range-form').is('.active'),
    'Custom range is active when selection does not match another interval'
  );

  assert.equal(this.$('li.active').length, 1, 'Only one interval is marked active');
});

test('Custom range reset button', function(assert) {
  assert.expect(6);

  this.interval = new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY'));

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod='day'
            interval=interval
        }}
    `);

  // Select a new date
  this.$('.datepicker:eq(0) .day:contains(20)').click();
  this.$('.datepicker:eq(1) .day:contains(21)').click();

  assert.equal(
    this.$('.datepicker:eq(0) .active').text(),
    '20Sep2014',
    'First date picker has newly selected start date'
  );

  assert.equal(
    this.$('.datepicker:eq(1) .active').text(),
    '21Oct2014',
    'Second date picker has newly selected end date'
  );

  //toggle advanced calendar
  Ember.run(() => openAdvancedCalendar(this));

  assert.equal(
    this.$('.navi-date-input')[0].value,
    '2014-09-20',
    'From text input displays the changed start day in `YYYY-MM-DD` format'
  );

  assert.equal(
    this.$('.navi-date-input')[1].value,
    '2014-10-22',
    'To text input displays the changed end day in `YYYY-MM-DD` format'
  );

  // Click reset
  this.$('.btn.btn-secondary').click();

  assert.equal(
    this.$('.datepicker:eq(0) .active').text(),
    '14Sep2014',
    'Clicking reset reverts to original start date'
  );

  assert.equal(this.$('.datepicker:eq(1) .active').text(), '14Oct2014', 'Clicking reset reverts to original end date');
});

test('Select custom interval', function(assert) {
  assert.expect(1);

  this.interval = new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY'));

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod='day'
            interval=interval
            setInterval=(action setInterval)
        }}
    `);

  // Select a new date
  this.$('.datepicker:eq(0) .day:contains(15)').click();
  this.$('.datepicker:eq(1) .day:contains(16)').click();

  this.set('setInterval', interval => {
    let selectedStart = moment('09-15-2014', 'MM-DD-YYYY'),
      selectedEnd = moment('10-16-2014', 'MM-DD-YYYY');

    assert.ok(
      interval.isEqual(new Interval(selectedStart, selectedEnd.add(1, 'day'))),
      'Interval comes from date picker and end date is one more than selected'
    );
  });

  // Click apply
  this.$('.btn.btn-primary').click();
});

/* == Calendar Bug - Date increments on apply == */

test('Custom Range Date doesn`t increment on apply', function(assert) {
  assert.expect(2);

  this.interval = new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY'));

  let expectedInterval = new Interval(moment('09-15-2014', 'MM-DD-YYYY'), moment('10-17-2014', 'MM-DD-YYYY'));

  this.render(`
        {{navi-date-range-picker
            interval=interval
            dateTimePeriod='day'
            setInterval=(action setInterval)
        }}
    `);

  // Select a new date
  this.$('.datepicker:eq(0) .day:contains(15)').click();
  this.$('.datepicker:eq(1) .day:contains(16)').click();

  this.set('setInterval', interval => {
    this.set('interval', interval);
    assert.ok(interval.isEqual(expectedInterval), 'Interval comes from first datepicker');
  });

  this.$('.btn.btn-primary').click();
  this.$('.btn.btn-primary').click();
});

test('Editing custom interval - string', function(assert) {
  assert.expect(1);

  this.interval = new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY'));

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod='day'
            interval=interval
            setInterval=(action setInterval)
        }}
    `);

  //toggle advanced calendar
  Ember.run(() => openAdvancedCalendar(this));

  // Set a new date and blur input to trigger change
  this.$('.navi-date-range-picker__start-input').val('2014-10-15');
  this.$('.navi-date-range-picker__start-input').blur();

  this.$('.navi-date-range-picker__end-input').val('2014-10-25');
  this.$('.navi-date-range-picker__end-input').blur();

  this.set('setInterval', interval => {
    let selectedStart = moment('10-15-2014', 'MM-DD-YYYY'),
      selectedEnd = moment('10-25-2014', 'MM-DD-YYYY');

    assert.ok(
      interval.isEqual(new Interval(selectedStart, selectedEnd.add(1, 'day'))),
      'Interval comes from date inputs and end date is one more than date entered'
    );
  });

  // Click apply
  this.$('.btn.btn-primary').click();
});

test('Editing custom interval - macros', function(assert) {
  assert.expect(2);

  this.interval = new Interval(moment('09-14-2014', 'MM-DD-YYYY'), moment('10-15-2014', 'MM-DD-YYYY'));

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod='day'
            interval=interval
            setInterval=(action setInterval)
        }}
    `);

  //toggle advanced calendar
  Ember.run(() => openAdvancedCalendar(this));

  // Set a new date and blur input to trigger change
  this.$('.navi-date-range-picker__start-input').val('P7D');
  this.$('.navi-date-range-picker__start-input').blur();

  this.$('.navi-date-range-picker__end-input').val('current');
  this.$('.navi-date-range-picker__end-input').blur();

  this.set('setInterval', interval => {
    assert.equal(
      interval._start.toString(),
      'P7D',
      'Interval start is a duration object with the duration entered in the input'
    );

    assert.equal(interval._end.toString(), 'current', 'Interval end is the macro `next` as enterd in the input');
  });

  // Click apply
  this.$('.btn.btn-primary').click();
});

test('Default interval for timegrains', function(assert) {
  assert.expect(4);

  // set dateTimePeriod to day
  this.dateTimePeriod = 'day';

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod=dateTimePeriod
            setInterval=(action setInterval)
        }}
    `);

  // Click the Custom range and click apply
  Ember.run(() => {
    openRangePicker(this);
    openCustomRange(this);
  });

  this.set('setInterval', interval => {
    let expectedInterval = new Interval(new Duration('P1D'), 'current');
    assert.ok(interval.isEqual(expectedInterval), 'Day timegrain defaults to last one day');
  });

  this.$('.btn.btn-primary').click();

  // set dateTimePeriod to week
  Ember.run(() => {
    Ember.set(this, 'dateTimePeriod', 'week');
  });

  this.set('setInterval', interval => {
    let expectedInterval = new Interval(new Duration('P1W'), 'current');
    assert.ok(interval.isEqual(expectedInterval), 'Week timegrain defaults to last one week');
  });

  this.$('.btn.btn-primary').click();

  // set dateTimePeriod to month
  Ember.run(() => {
    Ember.set(this, 'dateTimePeriod', 'month');
  });

  this.set('setInterval', interval => {
    let expectedInterval = new Interval(new Duration('P1M'), 'current');
    assert.ok(interval.isEqual(expectedInterval), 'Month timegrain defaults to last one month');
  });

  this.$('.btn.btn-primary').click();

  // set dateTimePeriod to quarter
  Ember.run(() => {
    Ember.set(this, 'dateTimePeriod', 'quarter');
  });

  this.set('setInterval', interval => {
    let expectedInterval = new Interval(new Duration('P3M'), 'current');
    assert.ok(interval.isEqual(expectedInterval), 'Quarter timegrain defaults to last three month');
  });

  this.$('.btn.btn-primary').click();
});

test('Default interval for `All` timegrain', function(assert) {
  assert.expect(3);

  this.dateTimePeriod = 'all';

  this.render(`
        {{navi-date-range-picker
            dateTimePeriod=dateTimePeriod
            setInterval=(action setInterval)
        }}
    `);

  assert.equal(this.$('li').length, 1, 'Only one option is available to select for All time grain');

  assert.equal(
    this.$('li:last-of-type > div:eq(0)')
      .text()
      .trim(),
    'Custom range',
    'Last option is "Custom range"'
  );

  // Click the Custom range and click apply
  Ember.run(() => {
    openRangePicker(this);
    openCustomRange(this);
  });

  this.set('setInterval', interval => {
    let expectedInterval = new Interval(new Duration('P7D'), 'current');

    assert.ok(interval.isEqual(expectedInterval), 'All timegrain defaults to last seven days');
  });

  this.$('.btn.btn-primary').click();
});

test('interval accepts interval or string', function(assert) {
  assert.expect(2);
  const expectedInterval = Interval.parseFromStrings('2018-10-31', '2018-11-01');

  this.set('interval', '2018-10-31/2018-11-01');
  this.set('setInterval', interval => {
    assert.ok(interval.isEqual(expectedInterval), 'Interval string is turned into an interval class instance');
  });

  this.render(`
    {{navi-date-range-picker
        dateTimePeriod='day'
        setInterval=(action setInterval)
        interval=interval
    }}
  `);

  this.$('.custom-range-form').click();
  this.$('.navi-date-range-picker__apply-btn').click();

  this.set('interval', Interval.parseFromStrings('2018-10-31', '2018-11-01'));
  this.set('setInterval', interval => {
    assert.ok(interval.isEqual(expectedInterval), 'Interval class instance is passed through');
  });

  this.$('.custom-range-form').click();
  this.$('.navi-date-range-picker__apply-btn').click();
});

function openRangePicker(test) {
  test.$('.navi-date-range-picker > .pick-container > .pick-value').click();
}

function openCustomRange(test) {
  test.$('.custom-range-form .pick-value').click();
}

function openAdvancedCalendar(test) {
  test.$('.navi-date-range-picker__advanced-calendar-toggle').click();
}
