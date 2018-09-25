import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

moduleFor('route:reports/report/view', 'Unit | Route | reports/report/view', {
  needs: [
    'service:navi-visualizations',
    'manifest:metric-label',
    'manifest:table',
    'manifest:line-chart',
    'manifest:base',
    'model:table',
    'service:bard-facts'
  ]
});

test('model', function(assert) {
  assert.expect(5);

  const serializedRequest = 'foo',
    factServiceResponse = 'bar',
    reportModel = {
      id: 1,
      request: {
        serialize: () => serializedRequest
      },
      visualization: {
        type: 'table',
        isValidForRequest: () => false, // Test invalid config case
        rebuildConfig(request, response) {
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
        }
      }
    };

  let route = this.subject({
    modelFor: () => reportModel,
    facts: {
      fetch(request, options) {
        assert.equal(request, serializedRequest, "Report's serialized request is given to fact service");

        assert.deepEqual(
          options,
          {
            page: 1,
            perPage: 10000,
            clientId: 'customReports',
            customHeaders: {
              uiView: 'report.spv.1'
            }
          },
          'Options from route are passed to fact service'
        );

        return Ember.RSVP.resolve({ response: factServiceResponse });
      }
    }
  });

  Ember.run(() => route.model()).then(model => {
    assert.equal(
      model,
      factServiceResponse,
      'Model hook returns response from fact service wrapped in a PromiseObject'
    );
  });
});

test('invalid visualization', function(assert) {
  assert.expect(1);

  this.register(
    'manifest:invalid-type',
    Ember.Object.extend({
      typeIsValid: () => false
    })
  );

  let route = this.subject(),
    report = {
      visualization: {
        type: 'invalid-type'
      }
    };

  Ember.run(() => {
    route._setValidVisualizationType(null, report);
  });

  assert.equal(
    Ember.get(report, 'visualization.type'),
    'table',
    'Any invalid visualization types are defaulted to table'
  );
});

test('runReport action', function(assert) {
  assert.expect(2);

  let request = { serialize: () => 'foo' },
    parentModel = {
      request
    },
    route = this.subject({
      parentModel,
      previousRequest: 'foo',
      refresh() {
        throw new Error('The route should not refresh if the request has not changed');
      }
    });

  /* == Request has no changes == */
  route.send('runReport');

  /* == Request has been changed == */
  route.refresh = () => {
    route.previousRequest = request.serialize();
    assert.ok(true, 'Action asks route to refresh model');
  };
  request.serialize = () => 'bar';
  route.send('runReport');

  /* == Request has been changed again== */
  request.serialize = () => 'foo';
  route.send('runReport');
});
