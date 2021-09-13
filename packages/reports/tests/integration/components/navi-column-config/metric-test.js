import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll, getContext, triggerEvent, triggerKeyEvent, fillIn } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { assertTooltipContent } from 'ember-tooltips/test-support/dom';

let MetadataService;

const TEMPLATE = hbs`
<NaviColumnConfig::Base
  @column={{this.column}}
  @cloneColumn={{optional this.cloneColumn}}
  @onAddFilter={{optional this.onAddFilter}}
  @onUpsertSort={{optional this.onUpsertSort}}
  @onRemoveSort={{optional this.onRemoveSort}}
  @onRenameColumn={{optional this.onRenameColumn}}
  @onUpdateColumnParam={{this.onUpdateColumnParam}}
  @toggleRollup={{optional this.toggleRollup}}
  @supportsSubtotal={{this.supportsSubtotal}}
/>
`;
module('Integration | Component | navi-column-config/metric', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    MetadataService = this.owner.lookup('service:navi-metadata');
    await MetadataService.loadMetadata();

    this.set('supportsSubtotal', false);

    this.onUpdateColumnParam = (paramId, paramKey) => {
      this.set('column.fragment.parameters', {
        ...this.column.fragment.parameters,
        [paramId]: paramKey,
      });
    };
  });

  async function getMetricColumn(metric, parameters) {
    const metadata = MetadataService.getById('metric', metric, 'bardOne');
    const factory = getContext().owner.lookup('service:fragment-factory');
    const fragment = factory.createColumnFromMeta(metadata, parameters);

    return {
      isFiltered: false,
      fragment,
    };
  }

  test('Configuring multiple parameters', async function (assert) {
    assert.expect(6);

    this.column = await getMetricColumn('multipleParamMetric', {
      type: 'l',
      aggregation: 'total',
      age: '6',
      currency: 'USD',
      currencyButNullDefault: 'CAD',
    });
    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-label').map((el) => el.textContent.trim()),
      ['Type Type', 'Aggregation Type', 'Age Type', 'Currency Type', 'CurrencyButNullDefault Type'],
      'Multiple parameters config lists are displayed'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-trigger').map((el) => el.textContent.trim()),
      ['Left', 'Total', '6 (30-34)', 'USD (Dollars)', 'CAD (Dollars)'],
      'Multiple parameters values are filled in with selected values'
    );

    await click('.navi-column-config-item__parameter-trigger.ember-power-select-trigger');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent.trim()),
      ['Left', 'Right', 'Middle'],
      'Param values with name key show up correctly'
    );

    await selectChoose('.navi-column-config-item__parameter', 'Right');
    await selectChoose(findAll('.navi-column-config-item__parameter')[1], 'Daily Average');
    await selectChoose(findAll('.navi-column-config-item__parameter')[2], '13-17');
    await selectChoose(findAll('.navi-column-config-item__parameter')[3], 'Euro');
    await selectChoose(findAll('.navi-column-config-item__parameter')[4], 'Drams');

    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-trigger').map((el) => el.textContent.trim()),
      ['Right', 'Daily Average', '2 (13-17)', 'EUR (Euro)', 'AMD (Drams)'],
      'A selected parameter can be changed and a null valued parameter can be changed'
    );

    assert
      .dom('.ember-tooltip-target')
      .exists({ count: 1 }, 'Description tooltip shows once for the one parameter that has a description');

    await triggerEvent('.ember-tooltip-target', 'mouseenter');

    assertTooltipContent(assert, {
      targetSelector: '.ember-tooltip-target',
      contentString: 'Gives the metric power to have directionality',
    });
  });

  test('Configuring null parameter', async function (assert) {
    assert.expect(2);

    this.column = await getMetricColumn('multipleParamMetric', {
      type: null,
      aggregation: 'total',
      age: '6',
      currency: 'USD',
      currencyButNullDefault: null,
    });
    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-trigger').map((el) => el.textContent.trim()),
      ['', 'Total', '6 (30-34)', 'USD (Dollars)', ''],
      'Null parameters have no selected values in trigger'
    );

    await selectChoose('.navi-column-config-item__parameter', 'Right');
    await selectChoose(findAll('.navi-column-config-item__parameter')[4], 'CAD (Dollars)');

    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-trigger').map((el) => el.textContent.trim()),
      ['Right', 'Total', '6 (30-34)', 'USD (Dollars)', 'CAD (Dollars)'],
      'Null value parameters can be changed'
    );
  });

  test('Configuring metric column', async function (assert) {
    assert.expect(7);

    this.column = await getMetricColumn('revenue', { currency: 'USD' });
    this.onRenameColumn = (newName) => {
      // this must be called with action in the template
      assert.equal(newName, 'Money', 'New display name is passed to name update action');
      return undefined;
    };
    this.onUpdateColumnParam = (paramId, paramKey) => {
      this.set('column.fragment.parameters', {
        ...this.column.fragment.parameters,
        [paramId]: paramKey,
      });
      assert.equal(`${paramId}=${paramKey}`, 'currency=CAD', 'Parameter is passed to onUpdateColumnParam method');
    };
    await render(TEMPLATE);

    const columnNameInput = '.navi-column-config-base__column-name input';
    assert
      .dom(columnNameInput)
      .hasProperty('placeholder', 'Revenue (USD)', 'Display name of column is shown as a placeholder');
    assert
      .dom('.navi-column-config-item__parameter-trigger')
      .hasText('USD (Dollars)', 'Current parameter is displayed in the dropdown input');

    await click('.navi-column-config-item__parameter-trigger.ember-power-select-trigger');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent.trim()),
      [
        '-1 (NULL)',
        '-2 (UNKNOWN)',
        'AED (Dirhams)',
        'AFA (Afghanis)',
        'ALL (Leke)',
        'AMD (Drams)',
        'ANG (Guilders)',
        'AOA (Kwanza)',
        'ARS (Pesos)',
        'AUD (Dollars)',
        'CAD (Dollars)',
        'USD (Dollars)',
        'EUR (Euro)',
        'INR (Rupees)',
      ],
      'The parameter values are loaded into the dropdown'
    );
    await selectChoose('.navi-column-config-item__parameter', 'CAD (Dollars)');

    assert
      .dom(columnNameInput)
      .hasProperty('placeholder', 'Revenue (CAD)', 'Placeholder is updated when parameter is changed');
    assert
      .dom('.navi-column-config-item__parameter-trigger')
      .hasText('CAD (Dollars)', 'Parameter selector shows new parameter value');

    await fillIn(columnNameInput, 'Money');
    await triggerKeyEvent(columnNameInput, 'keyup', 13);
  });

  test('metrics do not render rollup button', async function (assert) {
    this.set('supportsSubtotal', true);
    this.column = await getMetricColumn('multipleParamMetric', {});

    await render(TEMPLATE);

    assert.dom('.navi-column-config-base__rollup-icon').doesNotExist('Rollup is not available on a metric column');
  });
});
