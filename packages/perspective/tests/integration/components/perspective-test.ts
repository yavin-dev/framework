import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, findAll, render, settled, waitFor, waitUntil } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { YavinVisualizationArgs } from 'navi-core/addon/visualization/component';
import { PerspectiveSettings } from '@yavin-ui/perspective/manifest';
import { buildTestRequest } from 'navi-core/test-support/request';
import type NaviFactsModel from 'navi-data/models/navi-facts';
import { taskFor } from 'ember-concurrency-ts';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { timeout } from 'ember-concurrency';
import { TestContext as Context } from 'ember-test-helpers';

interface TestContext extends Context, YavinVisualizationArgs<PerspectiveSettings> {}

const TEMPLATE = hbs`
  <Perspective
    @request={{this.request}}
    @response={{this.response}}
    @settings={{this.settings}}
    @isReadOnly={{this.isReadOnly}}
    @onUpdateSettings={{this.onUpdateSettings}}
    class="w-full h-50"
  />`;

module('Integration | Component | perspective', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const metadataService = this.owner.lookup('service:navi-metadata');
    await metadataService.loadMetadata({ dataSourceName: 'bardOne' });
    const factService = this.owner.lookup('service:navi-facts');

    this.settings = {};
    this.request = buildTestRequest(
      [
        { cid: 'cid_uniqueIdentifier', field: 'uniqueIdentifier' },
        { cid: 'cid_totalPageViews', field: 'totalPageViews' },
        { cid: 'cid_revenue(currency=USD)', field: 'revenue', parameters: { currency: 'USD' } },
      ],
      [{ cid: 'cid_age', field: 'age', parameters: { field: 'id' } }],
      { start: '2016-05-30 00:00:00.000', end: '2016-06-04 00:00:00.000' },
      'day'
    );
    const model = (await taskFor(factService.fetch).perform(this.request)) as NaviFactsModel;
    this.onUpdateSettings = () => null;
    this.response = model.response;
  });

  test('it renders', async function (this: TestContext, assert) {
    await render(TEMPLATE);
    assert.dom('perspective-viewer').exists('it renders a perspective-view element');

    await waitFor('th', { timeout: 5000 });
    const headers = findAll('th').map((th) => th.textContent);
    assert.deepEqual(
      headers,
      ['age(field=id)', 'revenue(currency=USD)', 'totalPageViews', 'uniqueIdentifier', 'network.dateTime(grain=day)'],
      'it renders correct table headers'
    );
    await settled();
  });

  test('it loads configuration', async function (this: TestContext, assert) {
    this.settings = {
      configuration: {
        plugin: 'X Bar',
      },
    };
    await render(TEMPLATE);
    assert.dom('perspective-viewer').exists('it renders a perspective-view element');

    await waitFor('perspective-viewer-d3fc-xbar', { timeout: 5000 });
    const element = find('perspective-viewer-d3fc-xbar');
    await waitUntil(() => element?.shadowRoot?.querySelector('.bottom-label'), { timeout: 5000 });
    assert.dom(element?.shadowRoot?.querySelector('.bottom-label')).hasText('age(field=id)', 'it loads configuration');

    this.set('settings', {
      configuration: {
        plugin: 'Datagrid',
      },
    });

    await waitUntil(() => findAll('th').length === 5, { timeout: 5000 });
    const headers = findAll('th').map((th) => th.textContent);
    assert.deepEqual(
      headers,
      ['age(field=id)', 'revenue(currency=USD)', 'totalPageViews', 'uniqueIdentifier', 'network.dateTime(grain=day)'],
      'it loads configuration after initial render'
    );
    await settled();
  });

  test('it saves configuration', async function (this: TestContext, assert) {
    assert.expect(3);

    this.onUpdateSettings = (settings) => {
      assert.deepEqual(settings?.configuration?.plugin, 'Datagrid', 'it saves configuration on update');
      assert.deepEqual(settings?.configuration?.sort, [], 'it saves configuration with no sorting');
    };
    await render(TEMPLATE);
    await waitFor('th', { timeout: 5000 });

    await timeout(2000);
    this.set('onUpdateSettings', (settings: PerspectiveSettings) => {
      assert.deepEqual(
        settings?.configuration?.sort,
        [['age(field=id)', 'desc']],
        'it saves configuration after initial render'
      );
    });

    //wait due to debouncing logic
    await click('.psp-header-leaf');
  });

  test('it does not save configuration when `isReadOnly` is true', async function (this: TestContext, assert) {
    assert.expect(1);

    this.onUpdateSettings = () => {
      assert.notOk(true, 'onUpdateSettings should not be called when `isReadOnly` is true');
    };

    this.isReadOnly = true;
    await render(TEMPLATE);
    await waitFor('th', { timeout: 5000 });
    assert.ok(true);
    await settled();
  });
});
