import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { clearRender, click, find, findAll, render, waitFor, waitUntil } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { YavinVisualizationArgs } from 'navi-core/visualization/component';
import { PerspectiveSettings } from '@yavin/perspective/manifest';
//@ts-ignore
import { buildTestRequest } from 'navi-core/test-support/request';
import { taskFor } from 'ember-concurrency-ts';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { timeout } from 'ember-concurrency';
import type { TestContext as Context } from 'ember-test-helpers';
import type NaviFactsService from 'navi-data/services/navi-facts';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { Grain } from 'navi-data/utils/date';

type ComponentArgs = YavinVisualizationArgs<PerspectiveSettings>;
interface TestContext extends Context, Omit<ComponentArgs, 'container'> {
  metadataService: NaviMetadataService;
  factService: NaviFactsService;
}

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
    this.metadataService = this.owner.lookup('service:navi-metadata');
    await this.metadataService.loadMetadata({ dataSourceName: 'bardOne' });
    this.factService = this.owner.lookup('service:navi-facts');

    this.settings = {};
    this.request = buildTestRequest(
      [
        { cid: 'cid_uniqueIdentifier', field: 'uniqueIdentifier' },
        { cid: 'cid_totalPageViews', field: 'totalPageViews' },
        { cid: 'cid_revenue(currency=USD)', field: 'revenue', parameters: { currency: 'USD' } },
      ],
      [{ cid: 'cid_age', field: 'age', parameters: { field: 'id' } }],
      { start: '2016-05-30 00:00:00.000', end: '2016-06-02 00:00:00.000' },
      'day'
    );
    const model = await taskFor(this.factService.fetch).perform(this.request);
    this.onUpdateSettings = () => null;
    this.response = model.response;
  });

  test('it renders', async function (this: TestContext, assert) {
    await render(TEMPLATE);
    assert.dom('perspective-viewer').exists('it renders a perspective-view element');

    await waitFor('th', { timeout: 10000 });
    const headers = findAll('th').map((th) => th.textContent);
    assert.deepEqual(
      headers,
      ['age(field=id)', 'revenue(currency=USD)', 'totalPageViews', 'uniqueIdentifier', 'network.dateTime(grain=day)'],
      'it renders correct table headers'
    );
  });

  test('it loads configuration', async function (this: TestContext, assert) {
    this.settings = {
      configuration: {
        plugin: 'X Bar',
      },
    };
    await render(TEMPLATE);
    assert.dom('perspective-viewer').exists('it renders a perspective-view element');

    await waitFor('perspective-viewer-d3fc-xbar', { timeout: 10000 });
    const element = find('perspective-viewer-d3fc-xbar');
    await waitUntil(() => element?.shadowRoot?.querySelector('.bottom-label'), { timeout: 10000 });
    assert.dom(element?.shadowRoot?.querySelector('.bottom-label')).hasText('age(field=id)', 'it loads configuration');

    this.set('settings', {
      configuration: {
        plugin: 'Datagrid',
      },
    });

    await waitUntil(() => findAll('th').length === 5, { timeout: 10000 });
    const headers = findAll('th').map((th) => th.textContent);
    assert.deepEqual(
      headers,
      ['age(field=id)', 'revenue(currency=USD)', 'totalPageViews', 'uniqueIdentifier', 'network.dateTime(grain=day)'],
      'it loads configuration after initial render'
    );
  });

  test('it saves configuration', async function (this: TestContext, assert) {
    assert.expect(3);

    this.onUpdateSettings = (settings) => {
      assert.deepEqual(settings?.configuration?.plugin, 'Datagrid', 'it saves configuration on update');
      assert.deepEqual(settings?.configuration?.sort, [], 'it saves configuration with no sorting');
    };
    await render(TEMPLATE);
    await waitFor('th', { timeout: 10000 });

    await timeout(1000);
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
    await waitFor('th', { timeout: 10000 });
    assert.ok(true);
  });

  test('it renders timeDimension columns correctly', async function (this: TestContext, assert) {
    assert.expect(2);
    await render(TEMPLATE);

    const fetchWithGrain = async (grain: Grain) => {
      this.request.timeGrainColumn!.parameters.grain = grain;
      const model = await taskFor(this.factService.fetch).perform(this.request);
      this.set('reponse', model.response);
      await clearRender();

      await render(TEMPLATE);
      await waitFor('td', { timeout: 10000 });
    };
    const getFirstRow = () => {
      const dateTimeElement = find('tbody tr:nth-child(1) td:last-child');
      return dateTimeElement?.textContent?.trim() ?? '';
    };

    await waitFor('td', { timeout: 10000 });
    const DATE = /\d\d?\/\d\d?\/\d{4}/;
    assert.ok(DATE.test(getFirstRow()), 'First row renders correctly for day grain');

    // Now restore the method to its original version
    await fetchWithGrain('hour');
    const DATETIME = /\d\d?\/\d\d?\/\d{4}, \d\d?:\d{2}:\d{2} [AP]M/;
    assert.ok(DATETIME.test(getFirstRow()), 'First row renders correctly for hour grain');
  });
});
