import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext } from 'ember-test-helpers';
import FragmentFactory from 'navi-core/services/fragment-factory';
import StoreService from 'ember-data/store';

const TEMPLATE = hbs`
  <NaviCellRenderers::TimeDimension
    @data={{this.data}}
    @column={{this.column}}
    @request={{this.request}}
  />`;

/**
 * Set the test context request property with a granularity string
 * @function _setRequestForTimeGrain
 * @param {Object} context - test context
 * @param {String} timeGrain - value of granularity
 * @return {Void}
 */
function _setRequestForTimeGrain(context: any, timeGrain: string) {
  context.request.timeGrainColumn.updateParameters({ grain: timeGrain });
}

module('Integration | Component | cell renderers/time-dimension', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;
    const factory = this.owner.lookup('service:fragment-factory') as FragmentFactory;

    this.set('data', {
      dateTime: '2016-06-03 11:12:13.000'
    });

    this.set(
      'request',
      store.createFragment('bard-request-v2/request', {
        columns: [factory.createColumn('time-dimension', 'dummy', 'dateTime', { grain: 'day' })],
        filters: [],
        sorts: [],
        requestVersion: '2.0',
        dataSource: 'dummy',
        table: 'network'
      })
    );

    this.set('column', {
      type: 'time-dimension',
      displayName: 'Date',
      attributes: {
        name: 'dateTime',
        parameters: {
          grain: 'day'
        }
      }
    });
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

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('06/03 - 06/09/2016', 'The date-time cell renders a week range with the same years correctly');
  });

  test('date-time renders week format with different years correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'week');
    this.set('data', { dateTime: '2015-12-30 00:00:00.000' });

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('12/30/2015 - 01/05/2016', 'The date-time cell renders a week range with different years correctly');
  });

  test('date-time renders month format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'month');

    await render(TEMPLATE);

    assert.dom('.table-cell-content').hasText('Jun 2016', 'The date-time cell renders the month value correctly');
  });

  test('date-time renders quarter format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'quarter');

    await render(TEMPLATE);

    assert.dom('.table-cell-content').hasText('Q2 2016', 'The date-time cell renders the quarter value correctly');
  });

  test('date-time renders year format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'year');

    await render(TEMPLATE);

    assert.dom('.table-cell-content').hasText('2016', 'The date-time cell renders the year value correctly');
  });

  test('date-time renders hour format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'hour');

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('06/03/2016 11:00:00', 'The date-time cell renders the hour value correctly');
  });

  test('date-time renders minute format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'minute');

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('06/03/2016 11:12:00', 'The date-time cell renders the minute value correctly');
  });

  test('date-time renders second format correctly', async function(assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'second');

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('06/03/2016 11:12:13', 'The date-time cell renders the second value correctly');
  });
});
