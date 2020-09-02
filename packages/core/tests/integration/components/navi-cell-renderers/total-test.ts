import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
//@ts-ignore
import { merge } from 'lodash-es';
import { CellRendererArgs } from 'navi-core/components/navi-table-cell-renderer';
import StoreService from 'ember-data/store';
import { TableColumn } from 'navi-core/components/navi-visualizations/table';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';

const TEMPLATE = hbs`
  <NaviCellRenderers::Total
    @data={{this.data}}
    @column={{this.column}}
    @request={{this.request}}
  />`;

const data: CellRendererArgs['data'] = {
  'network.dateTime(grain=day)': 'Header'
};

interface TestContext extends Context {
  column: TableColumn;
  data: Record<string, string>;
  request: RequestFragment;
}

module('Integration | Component | cell renderers/total', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;

    this.set('data', data);
    this.set(
      'request',
      store.createFragment('bard-request-v2/request', {
        columns: [
          { type: 'timeDimension', field: 'network.dateTime', parameters: { grain: 'day' }, source: 'bardOne' }
        ],
        filters: [],
        sorts: [],
        requestVersion: '2.0',
        dataSource: 'dummy',
        table: 'network'
      })
    );

    const fragment = this.request.columns.objectAt(0) as ColumnFragment;
    const column: TableColumn = {
      fragment,
      attributes: {},
      columnId: 0
    };
    this.set('column', column);

    await render(TEMPLATE);
  });

  test('it renders', function(assert) {
    assert.expect(5);

    assert.dom('.table-cell--total').isVisible('the total cell is rendered');

    assert.dom('.table-cell--total').hasText('Header', 'the total cell displays the correct field from the data');

    assert.dom('.table-cell__info-message').isNotVisible('the info message and icon are not visible');

    this.set(
      'data',
      merge({}, data, {
        __meta__: {
          hasPartialData: true
        }
      })
    );

    assert.dom('.table-cell__info-message').isVisible('the info message is visible when the partial data flag is true');

    assert
      .dom('.table-cell__info-message--icon')
      .isVisible('the info message icon is visible when the partial data flag is true');
  });
});
