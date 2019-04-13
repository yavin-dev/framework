import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import Ember from 'ember';
import ReportToWidgetMixin from 'navi-dashboards/mixins/routes/report-to-widget';
import { module, test } from 'qunit';

module('Unit | Mixin | routes/report to widget', function() {
  test('addToDashboard', function(assert) {
    assert.expect(3);

    let visualizationMetadata = 'foo bar',
      serializedRequest = 123,
      dashboardId = 5,
      tempWidgetId = 1000,
      reportModel = {
        request: {
          clone: () => serializedRequest
        },
        visualization: {
          serialize: () => visualizationMetadata
        }
      },
      RouteObject = EmberObject.extend(ReportToWidgetMixin, Ember.ActionHandler, {
        /* == Mock Data == */
        modelFor: () => reportModel,

        /* == Transition Asserts == */
        transitionTo(route, id, { queryParams }) {
          assert.equal(
            route,
            'dashboards.dashboard.widgets.add',
            'addToDashboard action transitions to new widget route'
          );

          assert.equal(id, dashboardId, 'addToDashboard transitions to correct dashboard id');

          assert.equal(queryParams.unsavedWidgetId, tempWidgetId, "Widget's temporary id is passed as a query param");
        }
      }),
      subject = RouteObject.create({
        store: {
          createRecord() {
            return { tempId: tempWidgetId };
          }
        }
      });

    // Trigger the action
    subject.send('addToDashboard', dashboardId, 'Test Title');
  });

  test('addToNewDashboard', function(assert) {
    assert.expect(3);

    let visualizationMetadata = 'foo bar',
      serializedRequest = 123,
      tempWidgetId = 1000,
      reportModel = {
        request: {
          clone: () => serializedRequest
        },
        visualization: {
          serialize: () => visualizationMetadata
        }
      },
      RouteObject = EmberObject.extend(ReportToWidgetMixin, Ember.ActionHandler, {
        /* == Mock Data == */
        modelFor: () => reportModel,

        /* == Transition Asserts == */
        transitionTo(route, { queryParams }) {
          assert.equal(route, 'dashboards.new', 'addToNewDashboard action transitions to new dashboard route');

          assert.equal(queryParams.title, 'Custom Dashboard Title', 'Dashboard title is passed as a query param');

          assert.equal(queryParams.unsavedWidgetId, tempWidgetId, "Widget's temporary id is passed as a query param");
        }
      }),
      subject = RouteObject.create({
        store: {
          createRecord() {
            return { tempId: tempWidgetId };
          }
        }
      });

    // Trigger the action
    subject.send('addToNewDashboard', 'Custom Dashboard Title', 'Test Title');
  });

  test('_createWidget', function(assert) {
    assert.expect(4);

    let visualizationMetadata = 'foo bar',
      serializedRequest = 123,
      tempWidgetId = 1000,
      reportModel = {
        request: {
          clone: () => serializedRequest
        },
        visualization: {
          serialize: () => visualizationMetadata
        }
      },
      RouteObject = Route.extend(ReportToWidgetMixin, {
        /* == Mock Data == */
        modelFor: () => reportModel
      }),
      subject = RouteObject.create({
        /* == Store Asserts == */
        store: {
          createRecord(type, record) {
            assert.equal(type, 'dashboard-widget', 'Widget model is created through store');

            assert.equal(record.title, 'Test Title', 'Given title is used for widget');

            assert.deepEqual(
              record.requests,
              [serializedRequest],
              'Requests is populated with the serialized request from the model'
            );

            assert.equal(
              record.visualization,
              visualizationMetadata,
              'visualization metadata is populated by property in report'
            );

            return {
              tempId: tempWidgetId
            };
          }
        }
      });

    subject._createWidget('Test Title');
  });
});
