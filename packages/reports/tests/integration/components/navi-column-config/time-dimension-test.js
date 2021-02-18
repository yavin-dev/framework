import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

const TEMPLATE = hbs`
  <NaviColumnConfig::Base
    @column={{this.column}}
    @cloneColumn={{optional this.cloneColumn}}
    @toggleColumnFilter={{optional this.toggleColumnFilter}}
    @onRenameColumn={{optional this.onRenameColumn}}
    @onUpdateColumnParam={{optional this.onUpdateColumnParam}}
  />
`;

module('Integration | Component | navi-column-config/time-dimension', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.fragmentFactory = this.owner.lookup('service:fragment-factory');
    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('Configuring time grain', async function (assert) {
    assert.expect(3);

    this.onUpdateColumnParam = (paramId, paramKey) => {
      this.set('column.fragment.parameters', {
        ...this.column.fragment.parameters,
        [paramId]: paramKey,
      });

      assert.deepEqual(
        `${paramId}=${paramKey}`,
        'grain=isoWeek',
        'The grain parameter is passed correctly to the action handler'
      );
    };

    this.column = {
      fragment: this.fragmentFactory.createColumn('timeDimension', 'bardOne', 'network.dateTime', { grain: 'day' }),
      isFiltered: true,
    };
    await render(TEMPLATE);

    await selectChoose('.navi-column-config-item__parameter', 'Week');

    assert
      .dom('.navi-column-config-item__parameter-label')
      .hasText('Time Grain Type', 'The Time Grain parameters is displayed');
    assert.dom('.navi-column-config-item__parameter-trigger').hasText('Week', 'The "Week" Time Grain is selected');
  });
});
