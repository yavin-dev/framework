import { run } from '@ember/runloop';
import { helper as buildHelper } from '@ember/component/helper';
import { get } from '@ember/object';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { initialize as extendUserModel } from 'navi-dashboards/initializers/user-model';
import config from 'ember-get-config';

module('Integration | Component | navi dashboard', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    extendUserModel();
    setupMock();

    this.owner.register('helper:route-action', buildHelper(() => () => {}), { instantiate: false });

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

    return this.owner
      .lookup('service:user')
      .findUser()
      .then(() => {
        //load metadata into the store
        return this.owner
          .lookup('service:bard-metadata')
          .loadMetadata()
          .then(() => {
            // Add some dashboard models to the store
            run(() => {
              let store = this.owner.lookup('service:store');
              store.push({
                data: [{ id: 1, type: 'dashboard-widget' }, { id: 2, type: 'dashboard-widget' }]
              });
            });
          });
      });
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('it renders', function(assert) {
    assert.expect(4);

    return settled().then(async () => {
      await render(hbs`{{navi-dashboard dashboard=dashboardModel}}`);

      assert
        .dom('.page-title')
        .hasText(this.get('dashboardModel.title'), 'Component renders header with dashboard title');

      assert
        .dom('.grid-stack .grid-stack-item')
        .exists({ count: 2 }, 'Component renders a grid-stack-item for each widget, ignoring ones that do not exist');

      assert
        .dom(findAll('.grid-stack .grid-stack-item')[1])
        .hasAttribute('data-gs-x', 3, 'Widget x position is based on layout');

      assert
        .dom(findAll('.grid-stack .grid-stack-item')[1])
        .hasAttribute('data-gs-width', 6, 'Widget width is based on layout');
    });
  });

  test('widget data', function(assert) {
    assert.expect(2);

    return settled().then(async () => {
      let dataForWidget = { 1: 'foo', 2: 'bar' };
      this.set('dataForWidget', dataForWidget);

      await render(hbs`{{navi-dashboard dashboard=dashboardModel dataForWidget=dataForWidget}}`);
      findAll('.navi-widget').forEach((elm, id) => {
        let emberId = this.$(elm).attr('id');
        let component = getOwner(this).lookup('-view-registry:main')[emberId];
        let widgetId = get(component, 'model.id');
        let data = get(this, 'data');

        assert.equal(data, dataForWidget[widgetId], 'widget gets matching model and data');
      });
    });
  });

  test('dashboard export', function(assert) {
    assert.expect(2);
    let originalFeatureFlag = config.navi.FEATURES.enableDashboardExport;

    return settled().then(async () => {
      config.navi.FEATURES.enableDashboardExport = true;
      await render(hbs`{{navi-dashboard dashboard=dashboardModel}}`);

      assert.ok($('.action.export').is(':visible'), 'Dashboard export button should be visible');

      config.navi.FEATURES.enableDashboardExport = false;
      await render(hbs`{{navi-dashboard dashboard=dashboardModel}}`);
      assert.notOk($('.action.export').is(':visible'), 'Dashboard export button should not be visible');

      config.navi.FEATURES.enableDashboardExport = originalFeatureFlag;
    });
  });

  test('dashboard schedule - config', function(assert) {
    assert.expect(2);
    let originalFeatureFlag = config.navi.FEATURES.enableScheduleDashboards;

    return settled().then(async () => {
      config.navi.FEATURES.enableScheduleDashboards = true;
      await render(hbs`{{navi-dashboard dashboard=dashboardModel}}`);

      assert.ok($('.action.schedule').is(':visible'), 'Dashboard schedule button should be visible');

      config.navi.FEATURES.enableScheduleDashboards = false;
      await render(hbs`{{navi-dashboard dashboard=dashboardModel}}`);
      assert.notOk($('.action.schedule').is(':visible'), 'Dashboard schedule button should not be visible');

      config.navi.FEATURES.enableScheduleDashboards = originalFeatureFlag;
    });
  });

  test('dashboard schedule - isUserOwner', function(assert) {
    assert.expect(1);

    return settled().then(async () => {
      this.set('dashboardModel.isUserOwner', false);

      await render(hbs`{{navi-dashboard dashboard=dashboardModel}}`);
      assert.notOk($('.action.schedule').is(':visible'), 'Dashboard schedule button should not be visible');
    });
  });
});
