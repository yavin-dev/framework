import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import BardMetadataAdapter from 'navi-data/adapters/metadata/bard';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { TestContext } from 'ember-test-helpers';

let Adapter: BardMetadataAdapter;

module('Unit | Adapter | metadata/bard', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function(this: TestContext) {
    Adapter = this.owner.lookup('adapter:metadata/bard');
  });

  test('_buildURLPath', function(assert) {
    assert.equal(
      Adapter['buildURLPath']('table', '', {}),
      'https://data.naviapp.io/v1/tables/',
      '_buildURLPath correctly built the URL path'
    );
  });

  test('fetchEverything', async function(assert) {
    const { tables } = await Adapter.fetchEverything();
    assert.deepEqual(
      tables.map((t: TODO) => ({
        name: t.name,
        grains: t.timeGrains.length,
        metrics: new Set(
          t.timeGrains.reduce(
            (all: Array<string>, g: TODO) => [...all, ...g.metrics.map(({ name }: { name: string }) => name)],
            []
          )
        ).size,
        dimensions: new Set(
          t.timeGrains.reduce(
            (all: Array<string>, g: TODO) => [...all, ...g.dimensions.map(({ name }: { name: string }) => name)],
            []
          )
        ).size
      })),
      [
        { dimensions: 29, grains: 7, metrics: 42, name: 'network' },
        { dimensions: 31, grains: 7, metrics: 42, name: 'tableA' },
        { dimensions: 31, grains: 6, metrics: 42, name: 'tableB' },
        { dimensions: 31, grains: 7, metrics: 42, name: 'protected' },
        { dimensions: 31, grains: 7, metrics: 33, name: 'tableC' }
      ],
      '`fetchEverything` correctly requested all datasource metadata'
    );
  });

  test('fetchAll', async function(assert) {
    const tables = await Adapter.fetchAll('table');
    assert.deepEqual(
      tables.map((t: { name: string }) => t.name),
      ['network', 'tableA', 'tableB', 'protected', 'tableC'],
      '`fetchAll` correctly requested table metadata'
    );
  });

  test('fetchById', async function(assert) {
    const payload = await Adapter.fetchById('metric', 'pageViews');
    const metric = payload ? payload[0] : payload;
    assert.deepEqual(
      metric,
      {
        category: 'Page Views',
        description: 'Commodi et et.',
        longName: 'Page Views',
        name: 'pageViews',
        type: 'number'
      },
      '`fetchById` correctly requested a single metric'
    );
  });
});
