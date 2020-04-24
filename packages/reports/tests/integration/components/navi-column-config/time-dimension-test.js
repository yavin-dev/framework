import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { helper as buildHelper } from '@ember/component/helper';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';

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

  hooks.beforeEach(async function() {
    this.cloneColumn = () => undefined;
    this.toggleColumnFilter = () => undefined;
    this.onUpdateColumnName = () => undefined;
  });

  test('Configuring time grain', async function(assert) {
    assert.expect(3);

    this.owner.register(
      'helper:update-report-action',
      buildHelper(() => timeGrain => {
        assert.deepEqual(
          timeGrain,
          { id: 'day', name: 'Day' },
          'The Time Grain is passed correctly to the action handler'
        );
      }),
      { instantiate: false }
    );

    this.column = {
      type: 'timeDimension',
      name: 'dateTime',
      fragment: 'dateTime',
      isFiltered: true,
      timeGrain: 'week',
      timeGrains: [
        {
          id: 'hour',
          name: 'Hour'
        },
        {
          id: 'day',
          name: 'Day'
        },
        {
          id: 'week',
          name: 'Week'
        }
      ]
    };

    await render(TEMPLATE);

    assert
      .dom('.navi-column-config-item__parameter-label')
      .hasText('Time Grain', 'The Time Grain parameters is displayed');
    assert.dom('.navi-column-config-item__parameter-trigger').hasText('Week', 'The "Week" Time Grain is selected');

    await selectChoose('.navi-column-config-item__parameter', 'Day');
  });
});
