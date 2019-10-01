import { run } from '@ember/runloop';
import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let Store;

module('Unit | Model | dashboard widget', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');

    Store.createRecord('user', { id: 'navi_user' });

    // Load metadata needed for request fragment
    let metadataService = this.owner.lookup('service:bard-metadata');
    await metadataService.loadMetadata();
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
    assert.expect(1);

    await run(async () => {
      const dashboard = await Store.findRecord('dashboard', 1);
      const widgets = await dashboard.get('widgets');
      const rec = widgets.objectAt(0);

      assert.deepEqual(
        rec.toJSON(),
        {
          title: 'Mobile DAU Goal',
          dashboard: '1',
          visualization: {
            type: 'goal-gauge',
            version: 1,
            metadata: {
              baselineValue: 200,
              goalValue: 1000,
              metric: { metric: 'adClicks', parameters: {} }
            }
          },
          requests: [
            {
              logicalTable: {
                table: 'network',
                timeGrain: 'day'
              },
              metrics: [{ metric: 'adClicks' }, { metric: 'navClicks' }],
              dimensions: [],
              filters: [],
              having: [],
              intervals: [
                {
                  end: 'current',
                  start: 'P1D'
                }
              ],
              bardVersion: 'v1',
              requestVersion: 'v1',
              sort: []
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
