import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { initialize as extendUserModel } from 'navi-dashboards/initializers/user-model';
import wait from 'ember-test-helpers/wait';
import config from 'ember-get-config';

const { get, getOwner } = Ember;

moduleForComponent(
  'navi-dashboard',
  'Integration | Component | navi dashboard',
  {
    integration: true,

    beforeEach() {
      extendUserModel();
      setupMock();

      this.register(
        'helper:route-action',
        Ember.Helper.helper(() => () => {}),
        { instantiate: false }
      );

      let dashboardModel = {
        title: 'Test Dashboard',
        isUserOwner: true,
        widgets: [1, 2],
        presentation: {
          version: 1,
          layout: [
            { column: 0, row: 0, height: 4, width: 3, widgetId: 1 },
            { column: 3, row: 0, height: 4, width: 6, widgetId: 2 },
            { column: 0, row: 5, height: 1, width: 1, widgetId: 123456 } // Test a widget that doesn't exist
          ],
          columns: 20
        },
        constructor: {
          modelName: 'dashboard'
        }
      };

      this.set('dashboardModel', dashboardModel);

      return this.container
        .lookup('service:user')
        .findUser()
        .then(() => {
          //load metadata into the store
          return this.container
            .lookup('service:bard-metadata')
            .loadMetadata()
            .then(() => {
              // Add some dashboard models to the store
              Ember.run(() => {
                let store = this.container.lookup('service:store');
                store.push({
                  data: [
                    { id: 1, type: 'dashboard-widget' },
                    { id: 2, type: 'dashboard-widget' }
                  ]
                });
              });
            });
        });
    },
    afterEach() {
      teardownMock();
    }
  }
);

test('it renders', function(assert) {
  assert.expect(4);

  return wait().then(() => {
    this.render(hbs`{{navi-dashboard dashboard=dashboardModel}}`);

    assert.equal(
      this.$('.page-title')
        .text()
        .trim(),
      this.get('dashboardModel.title'),
      'Component renders header with dashboard title'
    );

    assert.equal(
      this.$('.grid-stack .grid-stack-item').length,
      2,
      'Component renders a grid-stack-item for each widget, ignoring ones that do not exist'
    );

    assert.equal(
      this.$('.grid-stack .grid-stack-item:eq(1)').attr('data-gs-x'),
      3,
      'Widget x position is based on layout'
    );

    assert.equal(
      this.$('.grid-stack .grid-stack-item:eq(1)').attr('data-gs-width'),
      6,
      'Widget width is based on layout'
    );
  });
});

test('widget data', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let dataForWidget = { 1: 'foo', 2: 'bar' };
    this.set('dataForWidget', dataForWidget);

    this.render(
      hbs`{{navi-dashboard dashboard=dashboardModel dataForWidget=dataForWidget}}`
    );
    this.$('.navi-widget').each((id, elm) => {
      let emberId = this.$(elm).attr('id');
      let component = getOwner(this).lookup('-view-registry:main')[emberId];
      let widgetId = get(component, 'model.id');
      let data = get(this, 'data');

      assert.equal(
        data,
        dataForWidget[widgetId],
        'widget gets matching model and data'
      );
    });
  });
});

test('dashboard export', function(assert) {
  assert.expect(2);
  let originalFeatureFlag = config.navi.FEATURES.enableDashboardExport;

  return wait().then(() => {
    config.navi.FEATURES.enableDashboardExport = true;
    this.render(hbs`{{navi-dashboard dashboard=dashboardModel}}`);

    assert.ok(
      $('.action.export').is(':visible'),
      'Dashboard export button should be visible'
    );

    config.navi.FEATURES.enableDashboardExport = false;
    this.render(hbs`{{navi-dashboard dashboard=dashboardModel}}`);
    assert.notOk(
      $('.action.export').is(':visible'),
      'Dashboard export button should not be visible'
    );

    config.navi.FEATURES.enableDashboardExport = originalFeatureFlag;
  });
});

test('dashboard schedule - config', function(assert) {
  assert.expect(2);
  let originalFeatureFlag = config.navi.FEATURES.enableScheduleDashboards;

  return wait().then(() => {
    config.navi.FEATURES.enableScheduleDashboards = true;
    this.render(hbs`{{navi-dashboard dashboard=dashboardModel}}`);

    assert.ok(
      $('.action.schedule').is(':visible'),
      'Dashboard schedule button should be visible'
    );

    config.navi.FEATURES.enableScheduleDashboards = false;
    this.render(hbs`{{navi-dashboard dashboard=dashboardModel}}`);
    assert.notOk(
      $('.action.schedule').is(':visible'),
      'Dashboard schedule button should not be visible'
    );

    config.navi.FEATURES.enableScheduleDashboards = originalFeatureFlag;
  });
});

test('dashboard schedule - isUserOwner', function(assert) {
  assert.expect(1);

  return wait().then(() => {
    this.set('dashboardModel.isUserOwner', false);

    this.render(hbs`{{navi-dashboard dashboard=dashboardModel}}`);
    assert.notOk(
      $('.action.schedule').is(':visible'),
      'Dashboard schedule button should not be visible'
    );
  });
});
