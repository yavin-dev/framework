import EmberObject, { get } from '@ember/object';
import { run } from '@ember/runloop';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { task } from 'ember-concurrency';

module('Unit | Route | reports/report/view', function (hooks) {
  setupTest(hooks);

  test('model', async function (assert) {
    assert.expect(6);

    const serializedRequest = 'foo',
      factServiceResponse = 'bar',
      reportModel = {
        id: 1,
        request: {
          serialize: () => serializedRequest,
        },
        visualization: {
          type: 'table',

          manifest: {
            validate: () => ({ isValid: true }),
            dataDidUpdate(_settings, request, response) {
              assert.equal(
                request,
                reportModel.request,
                'When config is invalid, rebuildConfig is given raw request object'
              );

              assert.equal(
                response,
                factServiceResponse,
                'When config is invalid, rebuildConfig is given fact service response'
              );
            },
            async normalizeModel(settings) {
              return { serialize: () => ({ ...settings }) };
            },
          },
        },
        updateVisualization(viz) {
          assert.deepEqual(viz.serialize(), {}, 'visualization is updated');
        },
      };

    class MockFacts extends EmberObject {
      @task *fetch(request, options) {
        assert.deepEqual(request, serializedRequest, "Report's serialized request is given to fact service");

        assert.deepEqual(
          options,
          {
            page: 1,
            perPage: 10000,
            clientId: 'customReports',
            customHeaders: {
              uiView: 'report.spv.1',
            },
            dataSourceName: undefined,
          },
          'Options from route are passed to fact service'
        );

        return yield resolve({ request: serializedRequest, response: factServiceResponse });
      }
    }

    const facts = MockFacts.create();
    let route = this.owner.factoryFor('route:reports/report/view').create({
      modelFor: () => reportModel,
      facts,
    });

    let model = await route.model();

    assert.deepEqual(
      model,
      { request: serializedRequest, response: factServiceResponse },
      'Model hook returns request and response from fact service wrapped in a PromiseObject'
    );
  });

  test('invalid visualization', function (assert) {
    assert.expect(2);

    let route = this.owner.lookup('route:reports/report/view'),
      report = {
        visualization: {
          manifest: {
            type: 'invalid- ',
            validate: () => ({ isValid: false }), // Test invalid config case
          },
        },
        updateVisualization(viz) {
          const newViz = viz.serialize();
          assert.deepEqual(
            newViz,
            {
              metadata: {
                columnAttributes: {},
              },
              type: 'table',
              version: 2,
            },
            'visualization is updated'
          );
          report.visualization = newViz;
        },
      };

    run(() => {
      route._setValidVisualizationType(null, report);
    });

    assert.equal(report.visualization.type, 'table', 'Any invalid visualization types are defaulted to table');
  });

  test('runReport action', function (assert) {
    assert.expect(2);

    const route = this.owner.factoryFor('route:reports/report/view').create({
      _hasRequestRun() {
        return true;
      },
      refresh() {
        throw new Error('The route should not refresh if the request has not changed');
      },
    });

    /* == Request has no changes == */
    route.send('runReport');

    /* == Request has been changed == */
    route.refresh = () => {
      assert.ok(true, 'Action asks route to refresh model');
    };
    route._hasRequestRun = () => false;
    route.send('runReport');

    route._hasRequestRun = () => true;
    route.send('forceRun');
  });
});
