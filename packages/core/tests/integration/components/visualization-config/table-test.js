import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import config from 'ember-get-config';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import { clickTrigger as toggleSelector, nativeMouseUp as toggleOption } from 'ember-power-select/test-support/helpers';

module('Integration | Component | visualization config/table', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('it renders', async function(assert) {
    assert.expect(1);

    let originalFlag = config.navi.FEATURES.enableTotals;
    config.navi.FEATURES.enableTotals = false;

    await render(hbs`{{visualization-config/table}}`);

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

    this.set('onUpdateConfig', () => {});
    this.set('request', {
      dimensions: [{ dimension: 'os' }, { dimension: 'age' }]
    });
    await render(hbs`{{visualization-config/table
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

    await render(hbs`{{visualization-config/table
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
    this.set('onUpdateConfig', () => {});

    await render(hbs`{{visualization-config/table
      request=request
      options=options
      onUpdateConfig=(action onUpdateConfig)
    }}`);

    assert
      .dom('.table-config__total-toggle-button--subtotal')
      .isNotVisible('The subtotal toggle is not visible when there are no dimension groupbys');

    this.set('request', {
      dimensions: [
        { dimension: { name: 'os', longName: 'Operating System' } },
        { dimension: { name: 'age', longName: 'Age' } }
      ]
    });

    this.set('onUpdateConfig', result => {
      assert.equal(
        result.showTotals.subtotal,
        'dateTime',
        '`dateTime` is used to subtotal when toggled on and updated using `onUpdateConfig`'
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
          'age',
          'Choosing another option in the dimension select updates the subtotal in the config'
        );
      });

    toggleSelector('.table-config__subtotal-dimension-select');
    toggleOption(find('.subtotal-dimension-select__options .ember-power-select-option[data-option-index="2"]'));

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

    let request = {
      dimensions: [
        { dimension: { name: 'os', longName: 'Operating System' } },
        { dimension: { name: 'age', longName: 'Age' } }
      ]
    };

    this.set('request', request);

    await render(hbs`{{visualization-config/table
      request=request
      options=options
    }}`);

    this.set('options', { showTotals: { subtotal: 'os' } });

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
