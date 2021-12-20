import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll, waitFor, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import config from 'ember-get-config';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import type DimensionBulkImportComponent from 'navi-reports/components/dimension-bulk-import';
import type { TestContext as Context } from 'ember-test-helpers';
import type { Server } from 'miragejs';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type FragmentFactory from 'navi-core/services/fragment-factory';
import type { DimensionColumn } from 'navi-data/addon/models/metadata/dimension';

const HOST = config.navi.dataSources[0].uri;

const input = '.dimension-bulk-import__input';
const valid = '.dimension-bulk-import__values--valid';
const invalid = '.dimension-bulk-import__values--invalid';
function getAll() {
  const value = '.filter-values--dimension-select__option-value';
  const [validTitle, invalidTitle] = findAll('.dimension-bulk-import__items-title').map((el) => el.textContent?.trim());
  return {
    pasted: (find(input) as HTMLInputElement)?.value,
    validTitle,
    valid: findAll(`${valid} ${value}`).map((el) => el.textContent?.trim()),
    invalidTitle,
    invalid: findAll(`${invalid} ${value}`).map((el) => el.textContent?.trim()),
  };
}

async function wait() {
  const powerSelect = '.filter-values--dimension-select__trigger';
  await Promise.all([waitFor(`${valid} ${powerSelect}`), waitFor(`${invalid} ${powerSelect}`)]);
}

const TEMPLATE = hbs`<DimensionBulkImport
    @isOpen={{true}}
    @query={{this.query}}
    @dimension={{this.dimension}}
    @onSelectValues={{this.onSelectValues}}
    @onCancel={{this.onCancel}}
  />`;

type ComponentArgs = DimensionBulkImportComponent['args'];
interface TestContext extends Context, ComponentArgs {
  server: Server;
}

module('Integration | Component | Dimension Bulk Import', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.server.get(
      `${HOST}/v1/dimensions/property/values/`,
      (_schema, _request) => {
        return {
          rows: [
            { id: '114', description: 'Property 1' },
            { id: '100001', description: 'Property 2' },
            { id: '100002', description: 'Property 3' },
            { id: '100003', description: 'Property 4' },
          ],
        };
      },
      { timing: 400 }
    );

    const naviMetadata = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;

    this.dimension = fragmentFactory.createFilter(
      'dimension',
      'bardOne',
      'property',
      { field: 'id' },
      'in',
      []
    ) as DimensionColumn;
    this.onSelectValues = () => undefined;
    this.onCancel = () => undefined;
    this.query = '100001,100002,56565565,78787,114,100003';

    await naviMetadata.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('bulk import Component renders', async function (this: TestContext, assert) {
    render(TEMPLATE);

    await waitFor('.loader');
    assert.dom('.loader').isVisible('loading spinner is visible');

    assert.deepEqual(
      getAll(),
      {
        pasted: '100001,100002,56565565,78787,114,100003',
        validTitle: 'Verified Values (0)',
        valid: [],
        invalidTitle: 'Unverified Values (0)',
        invalid: [],
      },
      'correctly shows empty states while loading'
    );

    await wait();

    assert.deepEqual(
      findAll('.dimension-bulk-import__items-title').map((el) => el.textContent?.trim()),
      ['Verified Values (4)', 'Unverified Values (2)'],
      'has valid id counts'
    );

    assert.deepEqual(
      getAll(),
      {
        pasted: '100001,100002,56565565,78787,114,100003',
        validTitle: 'Verified Values (4)',
        valid: ['100001', '100002', '114', '100003'],
        invalidTitle: 'Unverified Values (2)',
        invalid: ['56565565', '78787'],
      },
      'correctly shows pasted, invalid, and pasted data'
    );
  });

  test('can paste new values', async function (this: TestContext, assert) {
    this.onSelectValues = (values) => {
      assert.deepEqual(values, ['114', '1', '2', '3'], 'new values are added');
    };
    await render(TEMPLATE);
    await fillIn(input, '1,2,3,114');
    await wait();

    assert.deepEqual(
      getAll(),
      {
        pasted: '1,2,3,114',
        valid: ['114'],
        validTitle: 'Verified Values (1)',
        invalid: ['1', '2', '3'],
        invalidTitle: 'Unverified Values (3)',
      },
      'new values are shown'
    );

    await click('.dimension-bulk-import__add-all');
  });

  test('onCancel action is triggered', async function (this: TestContext, assert) {
    this.onCancel = () => assert.ok(true, 'onCancel action is triggered');

    await render(TEMPLATE);

    await click('.dimension-bulk-import__cancel');
  });

  test('add verified values', async function (this: TestContext, assert) {
    this.onSelectValues = (values) => {
      assert.deepEqual(values, ['100002', '114', '100003'], 'verified values are added');
    };
    await render(TEMPLATE);
    await wait();

    // remove verified value
    await click(`${valid} .ember-power-select-multiple-remove-btn`);
    await click('.dimension-bulk-import__add-verified');
  });

  test('add all values', async function (this: TestContext, assert) {
    this.onSelectValues = (values) => {
      assert.deepEqual(values, ['100002', '114', '100003', '78787'], 'all values are added');
    };
    await render(TEMPLATE);
    await wait();

    // remove verified value
    await click(`${valid} .ember-power-select-multiple-remove-btn`);
    // remove unverified value
    await click(`${invalid} .ember-power-select-multiple-remove-btn`);
    await click('.dimension-bulk-import__add-all');
  });
});
