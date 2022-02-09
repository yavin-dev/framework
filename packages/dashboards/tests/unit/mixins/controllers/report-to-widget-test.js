import EmberObject from '@ember/object';
import Ember from 'ember';
import ReportToWidgetMixin from 'navi-dashboards/mixins/controllers/report-to-widget';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Mixin | controllers/report to widget', function (hooks) {
  setupTest(hooks);

  test('addToDashboard', function (assert) {
    assert.expect(3);

    const visualizationMetadata = 'foo bar',
      serializedRequest = 123,
      dashboardId = 5,
      tempWidgetId = 1000,
      reportModel = {
        request: {
          clone: () => serializedRequest,
        },
        visualization: {
          serialize: () => visualizationMetadata,
          clone: () => visualizationMetadata,
        },
      },
      subject = EmberObject.extend(ReportToWidgetMixin, Ember.ActionHandler, {
        /* == Transition Asserts == */
        transitionToRoute: (route, id, { queryParams }) => {
          assert.equal(
            route,
            'dashboards.dashboard.widgets.add',
            'addToDashboard action transitions to new widget route'
          );

          assert.equal(id, dashboardId, 'addToDashboard transitions to correct dashboard id');

          assert.equal(queryParams.unsavedWidgetId, tempWidgetId, "Widget's temporary id is passed as a query param");
        },
      }).create({
        store: {
          createRecord() {
            return {
              tempId: tempWidgetId,
              updateVisualization: (vis) => vis,
            };
          },
        },
      });

    // Trigger the action
    subject.send('addToDashboard', reportModel, dashboardId, 'Test Title');
  });

  test('addToNewDashboard', function (assert) {
    assert.expect(3);

    const visualizationMetadata = 'foo bar',
      serializedRequest = 123,
      tempWidgetId = 1000,
      reportModel = {
        request: {
          clone: () => serializedRequest,
        },
        visualization: {
          serialize: () => visualizationMetadata,
          clone: () => visualizationMetadata,
        },
      },
      subject = EmberObject.extend(ReportToWidgetMixin, Ember.ActionHandler, {
        /* == Transition Asserts == */
        transitionToRoute(route, { queryParams }) {
          assert.equal(route, 'dashboards.new', 'addToNewDashboard action transitions to new dashboard route');

          assert.equal(queryParams.title, 'Custom Dashboard Title', 'Dashboard title is passed as a query param');

          assert.equal(queryParams.unsavedWidgetId, tempWidgetId, "Widget's temporary id is passed as a query param");
        },
      }).create({
        store: {
          createRecord() {
            return {
              tempId: tempWidgetId,
              updateVisualization: (vis) => vis,
            };
          },
        },
      });

    // Trigger the action
    subject.send('addToNewDashboard', reportModel, 'Custom Dashboard Title', 'Test Title');
  });

  test('_createWidget', function (assert) {
    assert.expect(4);
    const visualization = { type: 'table' };
    const serializedRequest = 123;
    const tempWidgetId = 1000;
    const reportModel = {
      request: {
        clone: () => serializedRequest,
      },
      visualization: {
        clone: () => visualization,
      },
    };
    const subject = EmberObject.extend(ReportToWidgetMixin).create({
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

          return {
            tempId: tempWidgetId,
            visualization,
            updateVisualization: (vis) => vis,
          };
        },
      },
    });

    const widget = subject._createWidget(reportModel, 'Test Title');
    assert.equal(widget.visualization.type, 'table', 'visualization metadata is populated by property in report');
  });
});
