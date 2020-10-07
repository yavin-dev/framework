import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import StoreService from 'ember-data/store';
import { TestContext as Context } from 'ember-test-helpers';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import { TableColumn } from 'navi-core/components/navi-visualizations/table';

interface TestContext extends Context {
  column: TableColumn;
  data: Record<string, string>;
  request: RequestFragment;
}

/**
 * Set the test context request property with a granularity string
 * @function _setRequestForTimeGrain
 * @param {Object} context - test context
 * @param {String} timeGrain - value of granularity
 * @return {Void}
 */
function _setRequestForTimeGrain(context: TestContext, timeGrain: string) {
  const column = context.request.columns.objectAt(0) as ColumnFragment;
  column.updateParameters({ grain: timeGrain });
  context.set('data', { [column.canonicalName]: '2016-06-03 11:12:13.000' });
}

const TEMPLATE = hbs`
  <NaviCellRenderers::TimeDimension
    @data={{this.data}}
    @column={{this.column}}
    @request={{this.request}}
  />`;

module('Integration | Component | cell renderers/time-dimension', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;

    this.set(
      'request',
      store.createFragment('bard-request-v2/request', {
        columns: [
          {
            type: 'timeDimension',
            field: 'network.dateTime',
            parameters: { grain: 'day' },
            alias: null,
            source: 'bardOne'
          }
        ],
        filters: [],
        sorts: [],
        requestVersion: '2.0',
        dataSource: 'bardOne',
        table: 'network'
      })
    );

    const fragment = this.request.columns.objectAt(0) as ColumnFragment;
    const column: TableColumn = {
      fragment,
      attributes: {},
      columnId: fragment.cid
    };
    this.set('column', column);
  });

  test('time-dimension renders second format correctly', async function(this: TestContext, assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'second');

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('06/03/2016 11:12:13', 'The time-dimension cell renders the second value correctly');
  });

  test('time-dimension renders minute format correctly', async function(this: TestContext, assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'minute');

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('06/03/2016 11:12:00', 'The time-dimension cell renders the minute value correctly');
  });

  test('time-dimension renders hour format correctly', async function(this: TestContext, assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'hour');

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('06/03/2016 11:00:00', 'The time-dimension cell renders the hour value correctly');
  });

  test('time-dimension renders day format correctly', async function(this: TestContext, assert) {
    assert.expect(2);

    _setRequestForTimeGrain(this, 'day');

    await render(TEMPLATE);

    assert.dom('.table-cell-content').isVisible('The time-dimension cell renderer is visible');

    assert.dom('.table-cell-content').hasText('06/03/2016', 'The time-dimension cell renders the day value correctly');
  });

  test('time-dimension renders week format correctly', async function(this: TestContext, assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'week');

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('06/03 - 06/09/2016', 'The time-dimension cell renders a week range with the same years correctly');
  });

  test('time-dimension renders week format with different years correctly', async function(this: TestContext, assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'week');
    this.set('data', { 'network.dateTime(grain=week)': '2015-12-30 00:00:00.000' });

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText(
        '12/30/2015 - 01/05/2016',
        'The time-dimension cell renders a week range with different years correctly'
      );
  });

  test('time-dimension renders month format correctly', async function(this: TestContext, assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'month');

    await render(TEMPLATE);

    assert.dom('.table-cell-content').hasText('Jun 2016', 'The time-dimension cell renders the month value correctly');
  });

  test('time-dimension renders quarter format correctly', async function(this: TestContext, assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'quarter');

    await render(TEMPLATE);

    assert.dom('.table-cell-content').hasText('Q2 2016', 'The time-dimension cell renders the quarter value correctly');
  });

  test('time-dimension renders year format correctly', async function(this: TestContext, assert) {
    assert.expect(1);

    _setRequestForTimeGrain(this, 'year');

    await render(TEMPLATE);

    assert.dom('.table-cell-content').hasText('2016', 'The time-dimension cell renders the year value correctly');
  });
});
