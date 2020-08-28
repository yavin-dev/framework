import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import StoreService from 'ember-data/store';
import { TableColumn } from 'navi-core/serializers/table';
import { TestContext as Context } from 'ember-test-helpers';
import RequestFragment from 'dummy/models/bard-request-v2/request';
import { RequestV2 } from 'navi-data/addon/adapters/facts/interface';
import ColumnFragment from 'dummy/models/bard-request-v2/fragments/column';

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
  context.set('column.parameters.grain', timeGrain);
  context.set('data', { [column.canonicalName]: '2016-06-03 11:12:13.000' });
}

const column: TableColumn = {
  type: 'timeDimension',
  field: 'network.dateTime',
  parameters: { grain: 'day' },
  attributes: {
    displayName: 'Date'
  }
};

const request: RequestV2 = {
  columns: [
    {
      type: 'timeDimension',
      field: 'network.dateTime',
      parameters: { grain: 'day' },
      alias: null
    }
  ],
  filters: [],
  sorts: [],
  requestVersion: '2.0',
  dataSource: 'dummy',
  table: 'network'
};

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

    this.set('column', column);
    this.set('request', store.createFragment('bard-request-v2/request', request));
    const columnFragment = this.request.columns.objectAt(0) as ColumnFragment;
    columnFragment.source = 'bardOne';
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
