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
    assert.expect(7);

    this.column = await getMetricColumn('multipleParamMetric', {
      type: 'l',
      aggregation: 'total',
      age: '6',
      currency: 'USD',
      currencyButNullDefault: 'CAD',
      userInput: '123 abc',
    });
    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-label').map((el) => el.textContent.trim()),
      ['Type', 'Aggregation', 'Age', 'Currency', 'CurrencyButNullDefault', 'UserInput'],
      'Multiple parameters config lists are displayed'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-trigger').map((el) => el.textContent.trim()),
      ['Left', 'total', '6', 'USD', 'CAD'],
      'Multiple parameters values are filled in with selected values'
    );

    await click('.navi-column-config-item__parameter-trigger.ember-power-select-trigger');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent.trim()),
      ['Left', 'Right', 'Middle'],
      'Param values with name key show up correctly'
    );

    await selectChoose('.navi-column-config-item__parameter', 'Right');
    await selectChoose(findAll('.navi-column-config-item__parameter')[1], 'dayAvg');
    await selectChoose(findAll('.navi-column-config-item__parameter')[2], '2');
    await selectChoose(findAll('.navi-column-config-item__parameter')[3], 'EUR');
    await selectChoose(findAll('.navi-column-config-item__parameter')[4], 'AMD');
    await fillIn('.navi-column-config-item__parameter-input', 'abc 123');

    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-trigger').map((el) => el.textContent.trim()),
      ['Right', 'dayAvg', '2', 'EUR', 'AMD'],
      'A selected parameter can be changed and a null valued parameter can be changed'
    );

    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-input').map((el) => el.value),
      ['abc 123'],
      'A user_input parameter can be changed'
    );

    assert
      .dom('.ember-tooltip-target')
      .exists({ count: 2 }, 'Description tooltip shows once for the two parameters that have a description');

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
      ['', 'total', '6', 'USD', ''],
      'Null parameters have no selected values in trigger'
    );

    await selectChoose('.navi-column-config-item__parameter', 'Right');
    await selectChoose(findAll('.navi-column-config-item__parameter')[4], 'CAD');

    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-trigger').map((el) => el.textContent.trim()),
      ['Right', 'total', '6', 'USD', 'CAD'],
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
      .hasText('USD', 'Current parameter is displayed in the dropdown input');

    await click('.navi-column-config-item__parameter-trigger.ember-power-select-trigger');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent.trim()),
      ['-1', '-2', 'AED', 'AFA', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'CAD', 'USD', 'EUR', 'INR'],
      'The parameter values are loaded into the dropdown'
    );
    await selectChoose('.navi-column-config-item__parameter', 'CAD');

    assert
      .dom(columnNameInput)
      .hasProperty('placeholder', 'Revenue (CAD)', 'Placeholder is updated when parameter is changed');
    assert
      .dom('.navi-column-config-item__parameter-trigger')
      .hasText('CAD', 'Parameter selector shows new parameter value');

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
