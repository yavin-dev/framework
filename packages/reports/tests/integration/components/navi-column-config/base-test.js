import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerKeyEvent, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

const TEMPLATE = hbs`
<NaviColumnConfig::Base
  @column={{this.column}}
  @cloneColumn={{optional this.cloneColumn}}
  @onAddFilter={{optional this.onAddFilter}}
  @onRenameColumn={{optional this.onRenameColumn}}
  @onUpdateColumnParam={{optional this.onUpdateColumnParam}}
/>`;

module('Integration | Component | navi-column-config/base', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.fragmentFactory = this.owner.lookup('service:fragment-factory');

    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('it renders ', async function (assert) {
    this.set('column', {
      isFiltered: false,
      fragment: this.fragmentFactory.createColumn('dimension', 'bardOne', 'property'),
    });

    await render(TEMPLATE);

    assert
      .dom('.navi-column-config-base__api-column-name')
      .hasText(this.column.fragment.columnMetadata.id, 'NaviColumnConfig::Base renders dimension API column name');

    assert
      .dom('.navi-column-config-base__api-column-name')
      .hasAttribute(
        'title',
        `API Column: ${this.column.fragment.columnMetadata.id}`,
        'NaviColumnConfig::Base renders a title attribute for the API Column name'
      );

    this.set('column', {
      fragment: this.fragmentFactory.createColumn('metric', 'bardOne', 'adClicks'),
    });

    assert
      .dom('.navi-column-config-base__api-column-name')
      .hasText(this.column.fragment.columnMetadata.id, 'NaviColumnConfig::Base renders metric API column name');

    this.set('column', {
      fragment: this.fragmentFactory.createColumn('timeDimension', 'bardOne', 'network.dateTime'),
    });

    assert
      .dom('.navi-column-config-base__api-column-name')
      .hasText(
        'network.dateTime',
        'NaviColumnConfig::Base has a special case for rendering the dateTime API column name'
      );
  });

  test('it supports action', async function (assert) {
    assert.expect(4);
    this.column = {
      fragment: this.fragmentFactory.createColumn('dimension', 'bardOne', 'property'),
    };
    this.cloneColumn = () => assert.ok(true, 'cloneColumn is called when clone is clicked');
    this.onAddFilter = () => assert.ok(true, 'onAddFilter is called when filter is clicked');
    this.onRenameColumn = (newName) =>
      assert.equal(newName, 'Some other value', 'onRenameColumn action is called with new column name');

    await render(TEMPLATE);

    const columnNameInput = '.navi-column-config-base__column-name input';
    assert
      .dom(columnNameInput)
      .hasProperty('placeholder', 'Property', "Column Name field has placeholder of column's display name");
    await fillIn(columnNameInput, 'Some other value');
    await triggerKeyEvent(columnNameInput, 'keyup', 13);

    await click('.navi-column-config-base__clone-icon');
    await click('.navi-column-config-base__filter-icon');
  });
});
