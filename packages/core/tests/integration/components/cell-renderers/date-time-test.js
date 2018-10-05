import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
  {{cell-renderers/date-time
    data=data
    column=column
    request=request
  }}`;

const data = {
  dateTime: '2016-06-03 11:12:13.000',
  'os|id': 'All Other',
  'os|desc': 'All Other',
  uniqueIdentifier: 172933788,
  totalPageViews: 3669828357
};

const column = {
  field: { dateTime: 'dateTime' },
  type: 'dateTime',
  displayName: 'Date'
};

const request = {
  dimensions: [{ dimension: 'os' }],
  metrics: [{ metric: 'uniqueIdentifier' }, { metric: 'totalPageViews' }],
  logicalTable: {
    table: 'network',
    timeGrain: {
      name: 'day'
    }
  }
};

moduleForComponent('cell-renderers/date-time', 'Integration | Component | cell renderers/date-time', {
  integration: true,
  beforeEach() {
    this.set('data', data);
    this.set('column', column);
    this.set('request', request);
  }
});

test('date-time renders day format correctly', function(assert) {
  assert.expect(2);
  this.render(TEMPLATE);

  assert.ok($('.table-cell-content').is(':visible'), 'The date-time cell renderer is visible');

  assert.equal(
    $('.table-cell-content')
      .text()
      .trim(),
    '06/03/2016',
    'The date-time cell renders the day value correctly'
  );
});

test('date-time renders week format correctly', function(assert) {
  assert.expect(1);

  _setRequestForTimeGrain(this, 'week');

  this.render(hbs`
    {{cell-renderers/date-time
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal(
    $('.table-cell-content')
      .text()
      .trim(),
    '06/03 - 06/09/2016',
    'The date-time cell renders a week range with the same years correctly'
  );
});

test('date-time renders week format with different years correctly', function(assert) {
  assert.expect(1);

  _setRequestForTimeGrain(this, 'week');
  this.set('data', { dateTime: '2015-12-30 00:00:00.000' });

  this.render(hbs`
    {{cell-renderers/date-time
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal(
    $('.table-cell-content')
      .text()
      .trim(),
    '12/30/2015 - 01/05/2016',
    'The date-time cell renders a week range with different years correctly'
  );
});

test('date-time renders month format correctly', function(assert) {
  assert.expect(1);

  _setRequestForTimeGrain(this, 'month');

  this.render(hbs`
    {{cell-renderers/date-time
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal(
    $('.table-cell-content')
      .text()
      .trim(),
    'Jun 2016',
    'The date-time cell renders the month value correctly'
  );
});

test('date-time renders quarter format correctly', function(assert) {
  assert.expect(1);

  _setRequestForTimeGrain(this, 'quarter');

  this.render(hbs`
    {{cell-renderers/date-time
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal(
    $('.table-cell-content')
      .text()
      .trim(),
    'Q2 2016',
    'The date-time cell renders the quarter value correctly'
  );
});

test('date-time renders year format correctly', function(assert) {
  assert.expect(1);

  _setRequestForTimeGrain(this, 'year');

  this.render(hbs`
    {{cell-renderers/date-time
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal(
    $('.table-cell-content')
      .text()
      .trim(),
    '2016',
    'The date-time cell renders the year value correctly'
  );
});

test('date-time renders hour format correctly', function(assert) {
  assert.expect(1);

  _setRequestForTimeGrain(this, 'hour');

  this.render(hbs`
    {{cell-renderers/date-time
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal(
    $('.table-cell-content')
      .text()
      .trim(),
    '06/03/2016 11:00:00',
    'The date-time cell renders the hour value correctly'
  );
});

test('date-time renders minute format correctly', function(assert) {
  assert.expect(1);

  _setRequestForTimeGrain(this, 'minute');

  this.render(hbs`
    {{cell-renderers/date-time
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal(
    $('.table-cell-content')
      .text()
      .trim(),
    '06/03/2016 11:12:00',
    'The date-time cell renders the minute value correctly'
  );
});

test('date-time renders second format correctly', function(assert) {
  assert.expect(1);

  _setRequestForTimeGrain(this, 'second');

  this.render(hbs`
    {{cell-renderers/date-time
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal(
    $('.table-cell-content')
      .text()
      .trim(),
    '06/03/2016 11:12:13',
    'The date-time cell renders the second value correctly'
  );
});

/**
 * Set the test context request property with a granularity string
 * @function _setRequestForTimeGrain
 * @param {Object} context - test context
 * @param {String} timeGrain - value of granularity
 * @return {Void}
 */
function _setRequestForTimeGrain(context, timeGrain) {
  context.set('request', {
    logicalTable: { timeGrain }
  });
}
