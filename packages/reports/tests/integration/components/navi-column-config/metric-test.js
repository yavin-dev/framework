import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import { A as arr } from '@ember/array';
import { helper as buildHelper } from '@ember/component/helper';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let MetadataService;

module('Integration | Component | navi-column-config/metric', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    MetadataService = this.owner.lookup('service:bard-metadata');

    return MetadataService.loadMetadata();
  });

  test('Configuring metric column', async function(assert) {
    assert.expect(5);

    const metric = this.owner.lookup('service:store').createFragment('bard-request/fragments/metric', {
      metric: await MetadataService.findById('metric', 'revenue'),
      parameters: {
        currency: 'USD'
      }
    });
    this.metadata = { style: { aliases: arr([]) } };
    this.editingColumn = {
      type: 'metric',
      name: metric.canonicalName,
      displayName: 'Revenue',
      sort: 'none',
      fragment: metric
    };
    this.cloneColumn = () => undefined;
    this.toggleColumnFilter = () => undefined;
    this.onUpdateColumnName = (/*newName*/) => {
      // this must be called with action in the template
      /**
       * TODO: Reenable column relabeling, uncomment line below
       */
      // assert.equal(newName, 'Money', 'New display name is passed to name update action');
      return undefined;
    };
    this.owner.register(
      'helper:update-report-action',
      buildHelper(() => {
        return (metricFragment, paramId, paramKey) => {
          assert.equal(
            metricFragment.canonicalName,
            'revenue(currency=USD)',
            'Metric name is passed with the currently selected parameter'
          );
          assert.equal(`${paramKey}=${paramId}`, 'currency=CAD', 'Parameter is passed to onUpdateMetricParam method');
          metric.set('parameters', { [paramKey]: paramId });
        };
      }),
      { instantiate: false }
    );
    await render(hbs`
      <NaviColumnConfig::Base
        @column={{this.editingColumn}} 
        @metadata={{this.metadata}}
        @cloneColumn={{this.cloneColumn}}
        @toggleColumnFilter={{this.toggleColumnFilter}}
        @onUpdateColumnName={{action this.onUpdateColumnName}}
      />
    `);

    // assert.dom('.navi-column-config-base__column-name-input').hasValue('Revenue', 'Display name of column is shown in the column input');
    assert
      .dom('.navi-column-config-metric__parameter-trigger')
      .hasText('Dollars (USD)', 'Current parameter is displayed in the dropdown input');

    await click('.navi-column-config-metric__parameter-trigger.ember-power-select-trigger');
    assert.deepEqual(
      findAll('.ember-power-select-option').map(el => el.textContent.trim()),
      [
        'NULL (-1)',
        'UNKNOWN (-2)',
        'Dirhams (AED)',
        'Afghanis (AFA)',
        'Leke (ALL)',
        'Drams (AMD)',
        'Guilders (ANG)',
        'Kwanza (AOA)',
        'Pesos (ARS)',
        'Dollars (AUD)',
        'Dollars (CAD)',
        'Dollars (USD)',
        'Euro (EUR)',
        'Rupees (INR)'
      ],
      'The parameter values are loaded into the dropdown'
    );
    await selectChoose('.navi-column-config-metric__parameter', 'Dollars (CAD)');

    // assert.dom('.navi-column-config-base__column-name-input').hasValue('Revenue', 'Custom display name is still shown when parameter is changed');
    assert
      .dom('.navi-column-config-metric__parameter-trigger')
      .hasText('Dollars (CAD)', 'Parameter selector shows new parameter value');

    // await fillIn('.navi-column-config-base__column-name-input', 'Money');

    // await triggerKeyEvent('.navi-column-config-base__column-name-input', 'keyup', 13);
  });
});
