import { run } from '@ember/runloop';
import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { unset } from 'lodash-es';

let Store;

module('Unit | Model | dashboard widget', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');

    Store.createRecord('user', { id: 'navi_user' });

    // Load metadata needed for request fragment
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('tempId', async function(assert) {
    assert.expect(3);

    await run(async () => {
      const dashboard = await Store.findRecord('dashboard', 1);
      const widget = Store.createRecord('dashboard-widget', {
        dashboard
      });

      assert.ok(!!get(widget, 'tempId'), '`tempId` exists when `id` does not');

      assert.equal(get(widget, 'tempId'), get(widget, 'tempId'), '`tempId` is always the same value');

      await widget.save().then(() => {
        assert.notOk(!!get(widget, 'tempId'), '`tempId` is null when `id` exists');
      });
    });
  });

  test('Retrieving Records', async function(assert) {
    assert.expect(4);

    await run(async () => {
      const dashboard = await Store.findRecord('dashboard', 1);
      const widgets = await dashboard.get('widgets');
      const rec = widgets.objectAt(0);

      const serializedWidget = rec.toJSON();
      const cids = serializedWidget.requests[0].columns.map(c => c.cid);
      const metricCid = serializedWidget.requests[0].columns[1].cid;
      cids.forEach((cid, idx) => {
        assert.equal(cid?.length, 10, 'column cid has proper value');
        //remove from validation since cid value is non deterministic
        unset(serializedWidget.requests[0], `columns[${idx}].cid`);
      });

      assert.deepEqual(
        serializedWidget,
        {
          title: 'Mobile DAU Goal',
          dashboard: '1',
          visualization: {
            type: 'goal-gauge',
            version: 2,
            metadata: {
              baselineValue: 200,
              goalValue: 1000,
              metricCid: metricCid
            }
          },
          requests: [
            {
              columns: [
                {
                  alias: null,
                  field: 'network.dateTime',
                  parameters: {
                    grain: 'day'
                  },
                  type: 'timeDimension'
                },
                {
                  alias: null,
                  field: 'adClicks',
                  parameters: {},
                  type: 'metric'
                },
                {
                  alias: null,
                  field: 'navClicks',
                  parameters: {},
                  type: 'metric'
                }
              ],
              dataSource: 'bardOne',
              filters: [
                {
                  field: 'network.dateTime',
                  operator: 'bet',
                  parameters: {
                    grain: 'day'
                  },
                  type: 'timeDimension',
                  values: ['P1D', 'current']
                }
              ],
              limit: null,
              requestVersion: '2.0',
              sorts: [],
              table: 'network'
            }
          ],
          createdOn: '2016-01-01 00:00:00.000',
          updatedOn: '2016-01-01 00:00:00.000'
        },
        'dashboard-widget record with id 1 is found in the store'
      );
    });
  });

  test('Request property', async function(assert) {
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

  test('Cloning Dashboard Widgets', async function(assert) {
    assert.expect(1);

    await run(async () => {
      const dashboard = await Store.findRecord('dashboard', 1);
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
