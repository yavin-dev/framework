import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
//@ts-ignore
import { nativeMouseUp } from '../../helpers/ember-power-select';
import StoreService from 'ember-data/store';
import { TestContext as Context } from 'ember-test-helpers';
import FragmentFactory from 'navi-core/services/fragment-factory';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

interface TestContext extends Context {
  request: RequestFragment;
  onUpdateFilter(): null;
  onRemoveFilter(): null;
}

const TEMPLATE = hbs`
<FilterCollection
  @request={{this.request}}
  @onUpdateFilter={{this.onUpdateFilter}}
  @onRemoveFilter={{this.onRemoveFilter}}
  @isCollapsed={{this.isCollapsed}}
  @onUpdateCollapsed={{this.onUpdateCollapsed}}
/>`;
module('Integration | Component | filter collection', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;
    const factory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.set(
      'request',
      store.createFragment('bard-request-v2/request', {
        columns: [],
        filters: [
          factory.createFilter('dimension', 'bardOne', 'age', {}, 'isnull', [false]),
          factory.createFilter('dimension', 'bardOne', 'property', {}, 'isnull', [true]),
          factory.createFilter('timeDimension', 'bardOne', 'network.dateTime', { grain: 'day' }, 'bet', []),
          factory.createFilter('metric', 'bardOne', 'pageViews', {}, 'gt', ['1000']),
          factory.createFilter('metric', 'bardOne', 'pageViews', {}, 'bet', ['1000', '2000']),
        ],
        sorts: [],
        requestVersion: '2.0',
        dataSource: 'bardOne',
        table: 'network',
      })
    );
    this.onUpdateFilter = () => null;
    this.onRemoveFilter = () => null;

    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('it renders', async function (assert) {
    assert.expect(4);

    this.set('onUpdateCollapsed', () =>
      assert.ok(false, 'onUpdateCollapsed is not called on click when not collapsed')
    );
    await render(TEMPLATE);

    assert.dom('.filter-collection__row').exists({ count: 5 }, 'Each request filter is represented by a filter row');

    assert.dom('.filter-collection__row .filter-collection__remove').isVisible('Each filter row has a remove button');

    assert.dom('.filter-collection__row .filter-collection__builder').isVisible('Each filter row has a filter builder');

    assert.dom('.filter-values--range-input').isVisible('Range input should be rendered');

    await click('.filter-collection');
  });

  test('collapsed', async function (assert) {
    assert.expect(3);

    this.set('isCollapsed', true);

    this.set('onUpdateCollapsed', (collapsed: boolean) =>
      assert.notOk(collapsed, 'onUpdateCollapsed(false) is called on click')
    );
    await render(TEMPLATE);

    assert
      .dom('span.filter-collection--collapsed-item')
      .exists({ count: 5 }, 'Each request filter is represented by a filter span');

    assert.dom('.filter-collection__remove').doesNotExist('Remove buttons are not visible');

    await click('.filter-collection--collapsed-item');
  });

  test('updating a filter', async function (this: TestContext, assert) {
    /* == Changing operator == */
    this.set('onUpdateFilter', (filter: FilterFragment, changeSet: Partial<FilterFragment>) => {
      assert.equal(filter, this.request.filters.objectAt(0), 'Filter to update is given to action');
      assert.deepEqual(changeSet, { values: [true] }, 'Operator update is requested');
    });
    await render(TEMPLATE);

    await click('.filter-builder__operator-trigger');
    await nativeMouseUp($('.ember-power-select-option:contains(Is Empty)')[0]);
  });

  test('remove a filter', async function (this: TestContext, assert) {
    assert.expect(1);

    this.set('onRemoveFilter', (filter: FilterFragment) => {
      assert.equal(
        filter,
        this.request.filters.objectAt(1),
        'When clicking remove icon, remove action is sent with selected filter'
      );
    });

    await render(TEMPLATE);

    await click(findAll('.filter-collection__remove')[1]);
  });
});
