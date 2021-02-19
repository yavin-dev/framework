import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import config from 'ember-get-config';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { A as arr } from '@ember/array';

module('Integration | Component | visualization config/table', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('it renders', async function (assert) {
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

  test('table config - feature flag set', async function (assert) {
    assert.expect(4);

    let originalFlag = config.navi.FEATURES.enableTotals;
    config.navi.FEATURES.enableTotals = true;

    this.set('onUpdateConfig', () => undefined);
    const columns = arr([{ field: 'os' }, { field: 'age' }]);
    this.set('request', {
      columns,
      dimensionColumns: columns,
    });
    await render(hbs`{{navi-visualization-config/table
      request=request
      onUpdateConfig=(action onUpdateConfig)
    }}`);

    assert.deepEqual(
      findAll('.input-group').map((el) => el.textContent.trim()),
      ['Grand Total', 'Subtotal'],
      'The totals toggle is displayed when the feature flag is set'
    );

    assert.dom('.denali-switch').exists({ count: 2 }, 'Two toggle buttons are displayed next to the labels');

    assert
      .dom('.table-config__total-toggle-button--grand-total')
      .isNotChecked('The toggle buttons are unchecked by default'),
      this.set('onUpdateConfig', (result) => {
        assert.ok(
          result.showTotals.grandTotal,
          'Clicking the button toggles and sends the flag `showGrandTotal` to `onUpdateConfig`'
        );
      });
    await click('.table-config__total-toggle-button--grand-total');
    config.navi.FEATURES.enableTotals = originalFlag;
  });

  test('table config - grandTotal flag option set', async function (assert) {
    assert.expect(1);

    let originalFlag = config.navi.FEATURES.enableTotals;
    config.navi.FEATURES.enableTotals = true;

    await render(hbs`{{navi-visualization-config/table
      options=options
    }}`);

    this.set('options', { showTotals: { grandTotal: true } });

    assert
      .dom('.table-config__total-toggle-button--grand-total')
      .isChecked('The grand total toggle button is checked when the flag in options is set');

    config.navi.FEATURES.enableTotals = originalFlag;
  });

  test('table config - subtotal', async function (assert) {
    assert.expect(5);

    let originalFlag = config.navi.FEATURES.enableTotals;
    config.navi.FEATURES.enableTotals = true;

    this.set('request', {});
    this.set('options', { showTotals: { grandTotal: true } });
    this.set('onUpdateConfig', () => undefined);

    await render(hbs`<NaviVisualizationConfig::Table
      @request={{this.request}}
      @options={{this.options}}
      @onUpdateConfig={{this.onUpdateConfig}}
    />`);

    assert
      .dom('.table-config__total-toggle-button--subtotal')
      .isNotVisible('The subtotal toggle is not visible when there are no dimension groupbys');

    const columns = arr([
      { cid: 'cid_dateTime', field: 'dateTime', displayName: 'Date Time' },
      { cid: 'cid_os', field: 'os', displayName: 'Operating System' },
      { cid: 'cid_age', field: 'age', displayName: 'Age' },
    ]);
    this.set('request', {
      columns: arr([{ cid: 'cid_metric', type: 'metric' }, ...columns]),
      dimensionColumns: columns,
    });

    this.set('onUpdateConfig', (result) => {
      assert.equal(
        result.showTotals.subtotal,
        'cid_dateTime',
        'The first dimension column is used when subtotal is toggled on and updated using `onUpdateConfig`'
      );
    });

    assert
      .dom('.table-config__subtotal-dimension-select')
      .isNotVisible('The dimension dropdown is hidden when subtotal is toggled off');

    //click the subtotal toggle
    await click('.table-config__total-toggle-button--subtotal');

    assert
      .dom('.table-config__subtotal-dimension-trigger')
      .isVisible('The dimension dropdown is visible when subtotal is toggled on');

    this.set('onUpdateConfig', (result) => {
      assert.equal(
        result.showTotals.subtotal,
        'cid_age',
        'Choosing another option in the dimension select updates the subtotal in the config'
      );
    });

    await selectChoose('.table-config__subtotal-dimension-trigger', 'Age');

    config.navi.FEATURES.enableTotals = originalFlag;
  });

  test('table config - subtotal flag option set', async function (assert) {
    assert.expect(2);

    let originalFlag = config.navi.FEATURES.enableTotals;
    config.navi.FEATURES.enableTotals = true;

    const columns = arr([
      { cid: 'cid_os', field: 'os', displayName: 'Operating System' },
      { cid: 'cid_age', field: 'age' },
    ]);
    let request = {
      columns,
      dimensionColumns: columns,
    };

    this.set('request', request);
    this.set('options', { showTotals: { subtotal: 'cid_os' } });

    await render(hbs`{{navi-visualization-config/table
      request=request
      options=options
    }}`);

    assert
      .dom('.table-config__total-toggle-button--subtotal')
      .isChecked('The subtotal toggle button is checked when the flag in options has a value');

    assert
      .dom('.table-config__subtotal-dimension-trigger')
      .hasText(' Operating System', 'The selected dimension is set when subtotal in options has a value');

    config.navi.FEATURES.enableTotals = originalFlag;
  });
});
