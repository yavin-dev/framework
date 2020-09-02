import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import config from 'ember-get-config';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickTrigger as toggleSelector, nativeMouseUp as toggleOption } from 'ember-power-select/test-support/helpers';
import { A as arr } from '@ember/array';

module('Integration | Component | visualization config/table', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('it renders', async function(assert) {
    assert.expect(1);

    let originalFlag = config.navi.FEATURES.enableTotals;
    config.navi.FEATURES.enableTotals = false;

    await render(hbs`{{navi-visualization-config/table}}`);

    assert
      .dom('.table-config')
      .hasText(
        'You can access more configuration in each of the column headers',
        'Table Configuration Component displays the warning message'
      );

    config.navi.FEATURES.enableTotals = originalFlag;
  });

  test('table config - feature flag set', async function(assert) {
    assert.expect(5);

    let originalFlag = config.navi.FEATURES.enableTotals;
    config.navi.FEATURES.enableTotals = true;

    this.set('onUpdateConfig', () => undefined);
    const columns = arr([{ field: 'os' }, { field: 'age' }]);
    this.set('request', {
      columns,
      dimensionColumns: columns
    });
    await render(hbs`{{navi-visualization-config/table
      request=request
      onUpdateConfig=(action onUpdateConfig)
    }}`);

    assert.dom('.table-config__header').hasText('Totals', 'The header text is displayed correctly');

    assert.deepEqual(
      findAll('.table-config__totals-toggle-label').map(el => el.textContent.trim()),
      ['Grand Total', 'Subtotal'],
      'The totals toggle is displayed when the feature flag is set'
    );

    assert
      .dom('.table-config__total-toggle-button.x-toggle-component')
      .exists({ count: 2 }, 'Two toggle buttons are displayed next to the labels');

    assert
      .dom('.table-config__total-toggle-button--grand-total.x-toggle-component .x-toggle-container-checked')
      .isNotVisible('The toggle buttons are unchecked by default'),
      this.set('onUpdateConfig', result => {
        assert.ok(
          result.showTotals.grandTotal,
          'Clicking the button toggles and sends the flag `showGrandTotal` to `onUpdateConfig`'
        );
      });
    await click('.table-config__total-toggle-button--grand-total .x-toggle-btn');

    config.navi.FEATURES.enableTotals = originalFlag;
  });

  test('table config - grandTotal flag option set', async function(assert) {
    assert.expect(1);

    let originalFlag = config.navi.FEATURES.enableTotals;
    config.navi.FEATURES.enableTotals = true;

    await render(hbs`{{navi-visualization-config/table
      options=options
    }}`);

    this.set('options', { showTotals: { grandTotal: true } });

    assert
      .dom('.table-config__total-toggle-button--grand-total.x-toggle-component .x-toggle-container-checked')
      .isVisible('The grand total toggle button is checked when the flag in options is set');

    config.navi.FEATURES.enableTotals = originalFlag;
  });

  test('table config - subtotal', async function(assert) {
    assert.expect(5);

    let originalFlag = config.navi.FEATURES.enableTotals;
    config.navi.FEATURES.enableTotals = true;

    this.set('request', {});
    this.set('options', { showTotals: { grandTotal: true } });
    this.set('onUpdateConfig', () => undefined);

    await render(hbs`{{navi-visualization-config/table
      request=request
      options=options
      onUpdateConfig=(action onUpdateConfig)
    }}`);

    assert
      .dom('.table-config__total-toggle-button--subtotal')
      .isNotVisible('The subtotal toggle is not visible when there are no dimension groupbys');

    const columns = arr([{ field: 'dateTime' }, { field: 'os' }, { field: 'age' }]);
    this.set('request', {
      columns: arr([{ type: 'metric' }, ...columns]),
      dimensionColumns: columns
    });

    this.set('onUpdateConfig', result => {
      assert.equal(
        result.showTotals.subtotal,
        1,
        'The first dimension column is used when subtotal is toggled on and updated using `onUpdateConfig`'
      );
    });

    //click the subtotal toggle
    await click('.table-config__total-toggle-button--subtotal .x-toggle-btn');

    assert
      .dom('.table-config__subtotal-dimension-select')
      .isVisible('The dimension dropdown is visible when subtotal is toggled on'),
      this.set('onUpdateConfig', result => {
        assert.equal(
          result.showTotals.subtotal,
          3,
          'Choosing another option in the dimension select updates the subtotal in the config'
        );
      });

    await toggleSelector('.table-config__subtotal-dimension-select');
    await toggleOption(find('.subtotal-dimension-select__options .ember-power-select-option[data-option-index="2"]'));

    //toggle off subtotal
    await click('.table-config__total-toggle-button--subtotal .x-toggle-btn');

    assert
      .dom('.table-config__subtotal-dimension-select')
      .isNotVisible('The dimension dropdown is hidden when subtotal is toggled off');

    config.navi.FEATURES.enableTotals = originalFlag;
  });

  test('table config - subtotal flag option set', async function(assert) {
    assert.expect(2);

    let originalFlag = config.navi.FEATURES.enableTotals;
    config.navi.FEATURES.enableTotals = true;

    const columns = arr([{ field: 'os', columnMetadata: { name: 'Operating System' } }, { field: 'age' }]);
    let request = {
      columns,
      dimensionColumns: columns
    };

    this.set('request', request);
    this.set('options', { showTotals: { subtotal: 0 } });

    await render(hbs`{{navi-visualization-config/table
      request=request
      options=options
    }}`);

    assert
      .dom('.table-config__total-toggle-button--subtotal.x-toggle-component .x-toggle-container-checked')
      .isVisible('The subtotal toggle button is checked when the flag in options has a value');

    assert.equal(
      find('.table-config__subtotal-dimension-select')
        .textContent.replace(/\s+/g, ' ')
        .trim(),
      'by Operating System',
      'The selected dimension is set when subtotal in options has a value'
    );

    config.navi.FEATURES.enableTotals = originalFlag;
  });
});
