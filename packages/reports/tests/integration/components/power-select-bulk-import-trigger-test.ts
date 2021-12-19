import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click, findAll, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import type NaviDimensionService from 'navi-data/services/navi-dimension';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import { taskFor } from 'ember-concurrency-ts';
import type FragmentFactory from 'navi-core/services/fragment-factory';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';

/**
 * Pastes a string into the power select search input
 *
 * @param text - text to paste
 */
async function paste(text: string): Promise<void> {
  const selector = '.ember-power-select-trigger-multiple-input';

  await triggerEvent(selector, 'paste', {
    clipboardData: {
      getData: () => text,
    },
  });
}

function getValues() {
  const value = '.filter-values--dimension-select__option-value';
  return {
    valid: findAll(`.dimension-bulk-import__values--valid ${value}`).map((el) => el.textContent?.trim()),
    invalid: findAll(`.dimension-bulk-import__values--invalid ${value}`).map((el) => el.textContent?.trim()),
  };
}

const TEMPLATE = hbs`
<PowerSelectMultiple
  @searchEnabled={{true}}
  @options={{this.options}}
  @selected={{this.selected}}
  @extra={{this.extra}}
  @triggerComponent="power-select-bulk-import-trigger"
  @onChange={{this.onChange}}
  @searchField="id"
  as |item|
>
  <span class="selected-dim-id">{{item.id}}</span>
</PowerSelectMultiple>
`;

let NaviDimension: NaviDimensionService;
let NaviMetadata: NaviMetadataService;
module('Integration | Component | power select bulk import trigger', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    NaviDimension = this.owner.lookup('service:navi-dimension');
    NaviMetadata = this.owner.lookup('service:navi-metadata');
    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    await NaviMetadata.loadMetadata({ dataSourceName: 'bardOne' });

    const filter = fragmentFactory.createFilter('dimension', 'bardOne', 'property', { field: 'id' }, 'in', []);

    const allProperties = await taskFor(NaviDimension.all).perform(filter as DimensionColumn);
    this.setProperties({
      options: allProperties.values,
      selected: [],
      onChange: () => undefined,
      extra: {
        filter,
        bulkImport: () => undefined,
      },
    });
  });

  test('it renders', async function (assert) {
    await render(TEMPLATE);

    assert.dom('.ember-power-select-multiple-options').exists('The component renders');
  });

  test('paste to trigger bulk import', async function (assert) {
    await render(TEMPLATE);

    /* == Typing text == */
    await fillIn('.ember-power-select-trigger-multiple-input', '100001,100002');
    assert.dom('.dimension-bulk-import').isNotVisible('Bulk import modal does not open when typing text with a ","');

    /* == Pasting text without "," == */
    await paste('Hello world');
    assert
      .dom('.dimension-bulk-import')
      .isNotVisible('Bulk import modal does not open when pasting text without a ","');

    /* == Pasting only "," == */
    await paste(',,,');
    assert
      .dom('.dimension-bulk-import')
      .isNotVisible('Bulk import modal is immediately closed when pasting only a ","');

    /* == Pasting text with "," == */
    await paste('78787, ,114, 101272');
    assert.dom('.dimension-bulk-import').isVisible('Bulk import modal opens when pasting text with a ","');

    assert.deepEqual(
      getValues(),
      {
        invalid: ['78787'],
        valid: ['114', '101272'],
      },
      'verified and unverified values are detected'
    );
  });

  test('importing verified values', async function (assert) {
    assert.expect(2);
    this.set('extra.bulkImport', (values: unknown[]) => {
      assert.deepEqual(values, ['114', '101272'], 'verified imported values are passed in');
    });

    await render(TEMPLATE);

    await paste('78787, ,114, 101272');

    assert.deepEqual(
      getValues(),
      {
        invalid: ['78787'],
        valid: ['114', '101272'],
      },
      'verified and unverified values are detected'
    );

    await click('.dimension-bulk-import__add-verified');
  });

  test('importing all values', async function (assert) {
    assert.expect(2);
    this.set('extra.bulkImport', (values: unknown[]) => {
      assert.deepEqual(values, ['114', '101272', '78787'], 'all imported values are passed in');
    });

    await render(TEMPLATE);

    await paste('78787, ,114, 101272');

    assert.deepEqual(
      getValues(),
      {
        invalid: ['78787'],
        valid: ['114', '101272'],
      },
      'verified and unverified values are detected'
    );

    await click('.dimension-bulk-import__add-all');
  });
});
