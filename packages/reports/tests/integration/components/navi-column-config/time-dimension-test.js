import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { helper as buildHelper } from '@ember/component/helper';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

const TEMPLATE = hbs`
  <NaviColumnConfig::Base
    @column={{this.column}}
    @metadata={{this.metadata}}
    @cloneColumn={{this.cloneColumn}}
    @toggleColumnFilter={{this.toggleColumnFilter}}
    @onUpdateColumnName={{action this.onUpdateColumnName}}
  />
`;

module('Integration | Component | navi-column-config/time-dimension', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    this.cloneColumn = () => undefined;
    this.toggleColumnFilter = () => undefined;
    this.onUpdateColumnName = () => undefined;
    this.fragmentFactory = this.owner.lookup('service:fragment-factory');
    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('Configuring time grain', async function(assert) {
    assert.expect(4);

    this.owner.register(
      'helper:update-report-action',
      buildHelper(() => (fragment, key, value) => {
        assert.equal(fragment.field, 'network.dateTime', 'The column fragment is pass correctly to the action handler');
        assert.deepEqual(
          { [key]: value },
          { grain: 'day' },
          'The grain parameter is passed correctly to the action handler'
        );
      }),
      { instantiate: false }
    );

    this.column = {
      type: 'timeDimension',
      name: 'dateTime',
      fragment: this.fragmentFactory.createColumn('timeDimension', 'bardOne', 'network.dateTime', { grain: 'week' }),
      isFiltered: true
    };
    await render(TEMPLATE);

    assert
      .dom('.navi-column-config-item__parameter-label')
      .hasText('Time Grain', 'The Time Grain parameters is displayed');
    assert.dom('.navi-column-config-item__parameter-trigger').hasText('Week', 'The "Week" Time Grain is selected');

    await selectChoose('.navi-column-config-item__parameter', 'Day');
  });
});
