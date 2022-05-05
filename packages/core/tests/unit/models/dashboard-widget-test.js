import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

let Store;

module('Unit | Model | dashboard widget', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    Store = this.owner.lookup('service:store');

    Store.createRecord('user', { id: 'navi_user' });

    // Load metadata needed for request fragment
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('tempId', async function (assert) {
    assert.expect(3);

    await run(async () => {
      const dashboard = await Store.findRecord('dashboard', 1);
      const widget = Store.createRecord('dashboard-widget', {
        dashboard,
      });

      assert.ok(!!widget.tempId, '`tempId` exists when `id` does not');

      assert.equal(widget.tempId, widget.tempId, '`tempId` is always the same value');

      await widget.save().then(() => {
        assert.notOk(!!widget.tempId, '`tempId` is null when `id` exists');
      });
    });
  });

  test(
    'Retrieving Records',
    async function (assert) {
      const dashboard = await Store.findRecord('dashboard', 3);
      const widgets = await dashboard.get('widgets');
      const rec = widgets.objectAt(0);
      const serializedWidget = rec.toJSON();

      assert.deepEqual(serializedWidget, {
        title: 'Mobile DAU Goal',
        createdOn: '2016-01-01 00:00:00.000',
        updatedOn: '2016-01-01 00:00:00.000',
        requests: [
          {
            filters: [
              {
                operator: 'bet',
                values: ['P1D', 'current'],
                field: 'network.dateTime',
                parameters: {
                  grain: 'day',
                },
                type: 'timeDimension',
              },
            ],
            columns: [
              {
                cid: 'm3',
                alias: null,
                field: 'network.dateTime',
                parameters: {
                  grain: 'day',
                },
                type: 'timeDimension',
              },
              {
                cid: 'm2',
                alias: null,
                field: 'adClicks',
                parameters: {},
                type: 'metric',
              },
              {
                cid: 'm1',
                alias: null,
                field: 'navClicks',
                parameters: {},
                type: 'metric',
              },
            ],
            table: 'network',
            sorts: [],
            rollup: {
              columnCids: [],
              grandTotal: false,
            },
            limit: null,
            requestVersion: '2.0',
            dataSource: 'bardOne',
          },
        ],
        visualization: {
          namespace: null,
          type: 'goal-gauge',
          version: 2,
          metadata: {
            baselineValue: 200,
            goalValue: 1000,
            metricCid: 'm1',
          },
        },
        dashboard: '3',
      });
    },
    'dashboard-widget record is found in the store'
  );

  test('Request property', async function (assert) {
    assert.expect(1);

    await run(async () => {
      const dashboard = await Store.findRecord('dashboard', 1);
      const widgets = await dashboard.get('widgets');
      const widget = widgets.objectAt(0);

      assert.equal(
        widget.get('request'),
        widget.get('requests.firstObject'),
        'Widget has a `request` property that is the same as the first request'
      );
    });
  });

  test('Cloning Dashboard Widgets', async function (assert) {
    assert.expect(1);

    await run(async () => {
      const dashboard = await Store.findRecord('dashboard', 8);
      const widgets = await dashboard.get('widgets');
      const widgetModel = widgets.objectAt(0);
      const clonedModel = widgetModel.clone().toJSON();
      const expectedModel = widgetModel.toJSON();

      // setting attributes to null, which are not necessary to check in clone object
      expectedModel.createdOn = null;
      expectedModel.updatedOn = null;
      expectedModel.dashboard = null;

      assert.deepEqual(clonedModel, expectedModel, 'The cloned widget model has the same attrs as original model');
    });
  });
});
