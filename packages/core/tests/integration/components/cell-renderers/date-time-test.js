import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
  {{navi-cell-renderers/date-time
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

module('Integration | Component | cell renderers/date-time', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('data', data);
    this.set('column', column);
    this.set('request', request);
  });

  test('date-time renders day format correctly', async function(assert) {
    assert.expect(2);
    await render(TEMPLATE);

    assert.dom('.table-cell-content').isVisible('The date-time cell renderer is visible');

    assert.dom('.table-cell-content').hasText('06/03/2016', 'The date-time cell renders the day value correctly');
  });

  test('date-time renders week format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'week');

    await render(hbs`
      {{navi-cell-renderers/date-time
        data=data
        column=column
        request=request
      }}
    `);

    assert
      .dom('.table-cell-content')
      .hasText('06/03 - 06/09/2016', 'The date-time cell renders a week range with the same years correctly');
  });

  test('date-time renders week format with different years correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'week');
    this.set('data', { dateTime: '2015-12-30 00:00:00.000' });

    await render(hbs`
      {{navi-cell-renderers/date-time
        data=data
        column=column
        request=request
      }}
    `);

    assert
      .dom('.table-cell-content')
      .hasText('12/30/2015 - 01/05/2016', 'The date-time cell renders a week range with different years correctly');
  });

  test('date-time renders month format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'month');

    await render(hbs`
      {{navi-cell-renderers/date-time
        data=data
        column=column
        request=request
      }}
    `);

    assert.dom('.table-cell-content').hasText('Jun 2016', 'The date-time cell renders the month value correctly');
  });

  test('date-time renders quarter format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'quarter');

    await render(hbs`
      {{navi-cell-renderers/date-time
        data=data
        column=column
        request=request
      }}
    `);

    assert.dom('.table-cell-content').hasText('Q2 2016', 'The date-time cell renders the quarter value correctly');
  });

  test('date-time renders year format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'year');

    await render(hbs`
      {{navi-cell-renderers/date-time
        data=data
        column=column
        request=request
      }}
    `);

    assert.dom('.table-cell-content').hasText('2016', 'The date-time cell renders the year value correctly');
  });

  test('date-time renders hour format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'hour');

    await render(hbs`
      {{navi-cell-renderers/date-time
        data=data
        column=column
        request=request
      }}
    `);

    assert
      .dom('.table-cell-content')
      .hasText('06/03/2016 11:00:00', 'The date-time cell renders the hour value correctly');
  });

  test('date-time renders minute format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'minute');

    await render(hbs`
      {{navi-cell-renderers/date-time
        data=data
        column=column
        request=request
      }}
    `);

    assert
      .dom('.table-cell-content')
      .hasText('06/03/2016 11:12:00', 'The date-time cell renders the minute value correctly');
  });

  test('date-time renders second format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'second');

    await render(hbs`
      {{navi-cell-renderers/date-time
        data=data
        column=column
        request=request
      }}
    `);

    assert
      .dom('.table-cell-content')
      .hasText('06/03/2016 11:12:13', 'The date-time cell renders the second value correctly');
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
});
