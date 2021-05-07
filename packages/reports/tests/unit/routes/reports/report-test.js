import { run } from '@ember/runloop';
import { resolve, reject } from 'rsvp';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Route | reports/report', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('model hook', async function (assert) {
    const localReports = [
        {
          id: undefined,
          tempId: '123-456',
        },
      ],
      webserviceReports = [
        {
          id: 1,
        },
      ];

    let route = this.owner.factoryFor('route:reports/report').create({
      store: {
        findRecord: (type, id) => A(webserviceReports).findBy('id', id),
        peekAll: () => localReports,
      },
      user: {
        findOrRegister: () => resolve(),
      },
      setDefaultVisualization: (report) => report,
    });

    const model1 = await route.model({ report_id: 1 });
    assert.equal(model1.id, 1, 'Route model looks up report based on id');

    const model2 = await route.model({ report_id: '123-456' });
    assert.equal(model2.tempId, '123-456', 'Route can find reports based on temp id');
  });

  test('findByTempId', function (assert) {
    const route = this.owner.factoryFor('route:reports/report').create({
      store: {
        peekAll() {
          return [{ tempId: 1 }, { tempId: 2 }, { tempId: 3 }];
        },
      },
    });

    assert.equal(route.findByTempId(2).tempId, 2, 'Reports can be found by temp id');

    assert.equal(route.findByTempId(50), undefined, 'Undefined is returned when no report has the given temp id');
  });

  test('setDefaultVisualization', function (assert) {
    const mockReport = {
        visualization: null,
      },
      route = this.owner.factoryFor('route:reports/report').create({
        store: {
          createFragment: (type) => {
            return { type };
          },
        },
      });

    assert.deepEqual(
      route.setDefaultVisualization(mockReport).visualization,
      { type: 'table' },
      'Default visualization is set for null value in visualization'
    );

    const visualization = {
      type: 'line-chart',
    };
    mockReport.visualization = visualization;

    assert.deepEqual(
      route.setDefaultVisualization(mockReport).visualization,
      visualization,
      'Default visualization is not set for types already present in visualization'
    );
  });

  test('revertChanges action', function (assert) {
    assert.expect(4);

    const serializedRequest = 'serializedRequestValue';
    let mockReport = {
        rollbackAttributes() {
          assert.ok(true, 'Report model is asked to rollback');
        },
        request: {
          serialize() {
            assert.ok(true, 'Report model is asked to serialize');
            return serializedRequest;
          },
        },
      },
      route = this.owner.lookup('route:reports/report');

    route.controllerFor = () => ({
      set(key, value) {
        assert.deepEqual(key, 'modifiedRequest', 'The route updates the modified request on the controller');
        assert.deepEqual(value, serializedRequest, 'The serialized request is passed');
      },
    });

    route.send('revertChanges', mockReport);
  });

  test('deactivate method', function (assert) {
    assert.expect(4);

    const serializedRequest = 'serializedRequestValue';
    const mockReport = {
        hasDirtyAttributes: true,
        rollbackAttributes() {
          assert.ok(true, 'Route model is asked to rollback');
        },
        request: {
          serialize() {
            assert.ok(true, 'Report model is asked to serialize');
            return serializedRequest;
          },
        },
      },
      route = this.owner.factoryFor('route:reports/report').create({
        modelFor() {
          return mockReport;
        },
        routeName: 'reports.report',
      });

    route.controllerFor = () => ({
      set(key, value) {
        assert.deepEqual(key, 'modifiedRequest', 'The route updates the modified request on the controller');
        assert.deepEqual(value, serializedRequest, 'The serialized request is passed');
      },
    });

    /* == Transition to different route == */
    route.deactivate();
  });

  test('saveReport action', function (assert) {
    assert.expect(2);

    let savePromise = reject(),
      mockReport = {
        save: () => savePromise,
      },
      mockNotificationService = {},
      route = this.owner.factoryFor('route:reports/report').create({
        naviNotifications: mockNotificationService,
        replaceWith: () => null, // Functionality covered in acceptance test
      });

    return run(() => {
      /* == Error save == */
      mockNotificationService.add = ({ style }) => {
        assert.equal(style, 'danger', 'Danger notification is shown when save was unsuccessful');
      };

      route.send('saveReport', mockReport);

      return savePromise.catch(() => {
        /* == Successful save == */
        mockNotificationService.add = ({ style }) => {
          assert.equal(style, 'success', 'Success notification is shown when save was successful');
        };
        savePromise = resolve();

        route.send('saveReport', mockReport);
        return savePromise;
      });
    });
  });

  test('updateTitle action', function (assert) {
    assert.expect(2);

    let mockReport = {
        title: 'Default Title',
      },
      route = this.owner.factoryFor('route:reports/report').create({
        modelFor() {
          return mockReport;
        },
      });

    assert.equal(route.modelFor(route.routeName).title, 'Default Title', '`Default Title` is the current report title');

    route.send('updateTitle', 'Edited Title');

    assert.equal(
      route.modelFor(route.routeName).title,
      'Edited Title',
      'Title of the report is updated with `Edited Title`'
    );
  });
});
