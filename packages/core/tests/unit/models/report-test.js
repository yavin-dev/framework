import { all } from 'rsvp';
import { run } from '@ember/runloop';
import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import config from 'ember-get-config';
import Mirage from 'ember-cli-mirage';
import DeliverableItem from 'navi-core/models/deliverable-item';

let Store, MetadataService;

const ExpectedRequest = {
    table: 'network',
    columns: [
      { type: 'time-dimension', field: 'dateTime', parameters: { grain: 'day' }, alias: null },
      { type: 'dimension', field: 'property', parameters: {}, alias: null },
      { type: 'metric', field: 'adClicks', parameters: {}, alias: null },
      { type: 'metric', field: 'navClicks', parameters: {}, alias: null }
    ],
    filters: [
      {
        type: 'time-dimension',
        field: 'dateTime',
        parameters: { grain: 'day' },
        operator: 'bet',
        values: ['2015-11-09 00:00:00.000', '2015-11-16 00:00:00.000']
      }
    ],
    sorts: [{ type: 'metric', field: 'navClicks', parameters: {}, direction: 'asc' }],
    requestVersion: '2.0',
    limit: null,
    dataSource: 'dummy'
  },
  ExpectedReport = {
    data: {
      attributes: {
        title: 'Hyrule News',
        request: ExpectedRequest,
        visualization: {
          type: 'line-chart',
          version: 1,
          metadata: {
            axis: {
              y: {
                series: {
                  type: 'dimension',
                  config: {
                    metric: { metric: 'adClicks', parameters: {} },
                    dimensionOrder: ['property'],
                    dimensions: [
                      { name: 'Property 1', values: { property: '114' } },
                      { name: 'Property 2', values: { property: '100001' } },
                      { name: 'Property 3', values: { property: '100002' } }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      relationships: {
        author: {
          data: {
            type: 'users',
            id: 'navi_user'
          }
        }
      },
      type: 'reports'
    }
  };

module('Unit | Model | report', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    await MetadataService.loadMetadata();
  });

  test('Retrieving records', async function(assert) {
    assert.expect(3);

    await run(async () => {
      const report = await Store.findRecord('report', 1);

      assert.ok(report, 'Found report with id 1');
      assert.ok(report instanceof DeliverableItem, 'Report should be instance of DeliverableItem');
      assert.deepEqual(report.serialize(), ExpectedReport, 'Fetched report has all attributes as expected');
    });
  });

  test('Coalescing find requests', async function(assert) {
    assert.expect(1);

    this.server.urlPrefix = `${config.navi.appPersistence.uri}`;
    this.server.get('/reports', (schema, request) => {
      assert.equal(
        request.queryParams['filter[reports.id]'],
        '1,2,4',
        'Multiple find requests are grouped using filter query param'
      );

      // Test case doesn't care about actual repsonse, so skip mocking it
      return new Mirage.Response(204);
    });

    await run(() =>
      all([
        this.owner.lookup('service:store').findRecord('report', 1),
        this.owner.lookup('service:store').findRecord('report', 2),
        this.owner.lookup('service:store').findRecord('report', 4)
      ]).catch(() => 'Ignore empty response error')
    );
  });

  test('Saving records', async function(assert) {
    assert.expect(1);

    await run(async () => {
      const user = await Store.findRecord('user', 'navi_user');
      const report = {
        title: 'New Report',
        author: user,
        request: null
      };

      const savedReport = await Store.createRecord('report', report).save();
      const id = savedReport.get('id');
      Store.unloadAll('report'); // flush cache/store

      await Store.findRecord('report', id);
      assert.ok(true, 'Newly created report is persisted');
    });
  });

  test('Cloning Reports', async function(assert) {
    assert.expect(2);

    await run(async () => {
      const model = await Store.findRecord('report', 1);
      const clonedModel = model.clone(Store);
      const expectedTitle = model.toJSON().title;

      assert.equal(clonedModel.title, expectedTitle, 'The report model is cloned as expected');

      assert.deepEqual(
        clonedModel.visualization.toJSON(),
        model.get('visualization').toJSON(),
        'Visualization config is also cloned'
      );
    });
  });

  test('isOwner', async function(assert) {
    assert.expect(2);

    await run(async () => {
      // Make sure user is loaded into store
      await Store.findRecord('user', 'navi_user');

      const report3 = await Store.findRecord('report', 3);
      assert.notOk(report3.get('isOwner'), 'isOwner returns false when author does not match user');

      const report1 = await Store.findRecord('report', 1);
      assert.ok(report1.get('isOwner'), 'isOwner returns true when user is the author of the report');
    });
  });

  test('isFavorite', async function(assert) {
    assert.expect(2);

    await run(async () => {
      // Make sure user is loaded into store
      await Store.findRecord('user', 'navi_user');
      const report1 = await Store.findRecord('report', 1);

      assert.notOk(report1.get('isFavorite'), 'isFavorite returns false when report is not in favorite list');

      const report2 = await Store.findRecord('report', 2);
      assert.ok(report2.get('isFavorite'), 'isFavorite returns true when report is in favorite list');
    });
  });

  test('tempId', async function(assert) {
    assert.expect(3);

    await run(async () => {
      const author = await Store.findRecord('user', 'navi_user');
      const report = Store.createRecord('report', {
        author,
        request: null
      });

      assert.ok(!!get(report, 'tempId'), '`tempId` exists when `id` does not');

      assert.equal(get(report, 'tempId'), get(report, 'tempId'), '`tempId` is always the same value');

      await report.save();
      assert.notOk(!!get(report, 'tempId'), '`tempId` is null when `id` exists');
    });
  });

  test('delivery rules relationship', async function(assert) {
    assert.expect(1);

    await run(async () => {
      const reportModel = await Store.findRecord('report', 3);
      const rules = await reportModel.get('deliveryRules');

      assert.equal(
        rules.get('firstObject'),
        Store.peekRecord('deliveryRule', 1),
        'report deliveryRule property contains deliveryRule model'
      );
    });
  });

  test('Validations', async function(assert) {
    assert.expect(5);

    await run(async () => {
      const reportModel = await Store.findRecord('report', 1);
      const s1 = await reportModel.validate();

      assert.ok(s1.validations.get('isValid'), 'report is valid');
      assert.equal(s1.validations.get('messages').length, 0, 'There are no validation errors');
      reportModel.set('title', '');

      const s2 = await reportModel.validate();
      assert.notOk(s2.validations.get('isValid'), 'report is invalid');
      assert.equal(s2.validations.get('messages').length, 1, 'There is one validation error');
      assert.notOk(s2.model.get('validations.attrs.title.isValid'), 'Title must have a value');
    });
  });

  test('deliveryRuleForUser', async function(assert) {
    assert.expect(1);

    await run(async () => {
      const user = await Store.findRecord('user', 'navi_user');
      const reportModel = await Store.findRecord('report', 3);

      Object.defineProperty(reportModel, 'user', {
        value: { getUser: () => user }
      });

      const rule = await reportModel.get('deliveryRuleForUser');
      assert.deepEqual(rule, Store.peekRecord('deliveryRule', 1), 'deliveryRule is fetched for current user');
    });
  });
});
