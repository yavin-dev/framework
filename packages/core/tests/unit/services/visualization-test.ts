/* eslint-disable @typescript-eslint/camelcase */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import type YavinVisualizationsService from 'navi-core/services/visualization';

let Service: YavinVisualizationsService;
module('Unit | Service | visualization', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    Service = this.owner.lookup('service:visualization');
  });

  test('it loads legacy manifests', function (assert) {
    assert.deepEqual(Service.getCategories(), ['Standard'], 'Category is shown');

    assert.deepEqual(
      Service.getVisualizations('Standard')
        .map((m) => m.typeName)
        .sort(),
      ['c3:bar-chart', 'c3:goal-gauge', 'c3:line-chart', 'c3:pie-chart', 'yavin:metric-label', 'yavin:table'],
      'legacy ones are loaded'
    );
  });

  test('legacy ones work properly', async function (assert) {
    const table = Service.getVisualization('yavin:table');

    assert.deepEqual(table.namespace, 'yavin', 'it correctly sets namespace property');
    assert.deepEqual(table.currentVersion, 2, 'it correctly sets currentVersion property');
    assert.deepEqual(table.type, 'table', 'it correctly sets type property');
    assert.deepEqual(table.typeName, 'yavin:table', 'it correctly sets typeName property');
    assert.deepEqual(table.niceName, 'Table', 'it correctly sets niceName property');
    assert.deepEqual(table.icon, 'table', 'it correctly sets icon property');

    assert.deepEqual(
      table.createModel().serialize(),
      {
        metadata: {
          columnAttributes: {},
        },
        type: 'table',
        version: 2,
      },
      'it creates new table model'
    );
    assert.deepEqual(
      table.createNewSettings(),
      {
        columnAttributes: {},
      },
      'it creates new table settings'
    );

    assert.deepEqual(
      (await table.normalizeModel({})).serialize(), // TODO: not quite right
      {
        metadata: {},
        type: 'table',
        version: 2,
      },
      'it normalizes settings'
    );

    const request = this.owner
      .lookup('service:store')
      .createFragment('request', { columns: [{ cid: 'cid_m1', type: 'metric', field: 'm1' }] });
    const settings = {
      columnAttributes: {
        cid_m1: {
          canAggregateSubtotal: false,
        },
      },
    };
    assert.deepEqual(
      table.dataDidUpdate(settings, request, NaviFactResponse.create({ rows: [] })),
      settings,
      'it succesfully rebuilds config and keeps valid settings'
    );

    assert.deepEqual(
      table.dataDidUpdate(
        {
          columnAttributes: {
            cid_m2: {
              canAggregateSubtotal: false,
            },
          },
        },
        request,
        NaviFactResponse.create({ rows: [] })
      ),
      {
        columnAttributes: {},
      },
      'it succesfully rebuilds config and removes invalid settings'
    );
  });
});
