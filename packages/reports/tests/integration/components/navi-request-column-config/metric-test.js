import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, triggerKeyEvent } from '@ember/test-helpers';
import { A as arr } from '@ember/array';
import { helper as buildHelper } from '@ember/component/helper';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let MetadataService;

module('Integration | Component | navi-request-column-config/metric', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    MetadataService = this.owner.lookup('service:bard-metadata');

    return MetadataService.loadMetadata();
  });

  test('Configuring metric column', async function(assert) {
    assert.expect(9);

    const metric = this.owner.lookup('service:store').createFragment('bard-request/fragments/metric', {
      metric: await MetadataService.findById('metric', 'revenue'),
      parameters: {
        currency: 'USD'
      }
    });
    this.set('metadata', { style: { aliases: arr([]) } });
    this.set('editingColumn', {
      type: 'metric',
      name: metric.canonicalName,
      displayName: 'Revenue',
      sort: 'none',
      fragment: metric
    });
    this.set('onClose', () => {
      assert.ok(true, 'onClose called');
    });
    this.set('onUpdateColumnName', newName => {
      assert.equal(newName, 'Money', 'New display name is passed to name update action');
    });
    this.owner.register(
      'helper:update-report-action',
      buildHelper(() => {
        return (metricName, paramId, paramKey) => {
          assert.equal(
            metricName,
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
        @column={{editingColumn}} 
        @metadata={{metadata}}
        @onClose={{action onClose}}
        @onUpdateColumnName={{action onUpdateColumnName}}
      />
    `);

    assert.dom('#columnName').hasValue('Revenue', 'Display name of column is shown in the column input');
    assert.dom('#columnParameter').hasText('Dollars (USD)', 'Current parameter is displayed in the dropdown input');

    await click('.navi-request-column-config__parameter-trigger.ember-power-select-trigger');
    assert.deepEqual(
      [...document.querySelectorAll('.ember-power-select-option')].map(el => el.textContent.trim()),
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
    await selectChoose('#columnParameter', 'Dollars (CAD)');

    assert.dom('#columnName').hasValue('Revenue', 'Custom display name is still shown when parameter is changed');
    assert.dom('#columnParameter').hasText('Dollars (CAD)', 'Parameter selector shows new parameter value');

    await fillIn('#columnName', 'Money');
    await triggerKeyEvent('#columnName', 'keyup', 13);

    await click('.navi-request-column-config__exit-icon');
  });
});
