import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

const TEMPLATE = hbs`
  <NaviColumnConfig::Base
    @column={{this.column}}
    @cloneColumn={{optional this.cloneColumn}}
    @onAddFilter={{optional this.onAddFilter}}
    @onUpsertSort={{optional this.onUpsertSort}}
    @onRemoveSort={{optional this.onRemoveSort}}
    @onRenameColumn={{optional this.onRenameColumn}}
    @onUpdateColumnParam={{optional this.onUpdateColumnParam}}
    @toggleRollup={{optional this.toggleRollup}}
    @supportsSubtotal={{this.supportsSubtotal}}
  />
`;

module('Integration | Component | navi-column-config/time-dimension', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.set('supportsSubtotal', false);
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

  test('Rollup button', async function (assert) {
    this.set('supportsSubtotal', true);
    this.column = {
      isFiltered: true,
      isRollup: false,
      isRequired: true,
      fragment: this.fragmentFactory.createColumn('timeDimension', 'bardOne', 'network.dateTime', { grain: 'day' }),
    };

    this.toggleRollup = () => {
      this.set('column.isRollup', !this.column.isRollup);
    };

    await render(TEMPLATE);

    assert.dom('.navi-column-config-base__rollup-icon').exists('Rollup toggle button exists');
    assert.dom('.navi-column-config-base__rollup-icon--active').doesNotExist('Rollup is not active on this column');

    await click('.navi-column-config-base__rollup-icon');

    assert.dom('.navi-column-config-base__rollup-icon--active').exists('Rollup is active when button is clicked');
  });
});
