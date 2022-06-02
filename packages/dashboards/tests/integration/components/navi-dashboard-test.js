import { run } from '@ember/runloop';
import { helper as buildHelper } from '@ember/component/helper';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import config from 'ember-get-config';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { get } from '@ember/object';
import { A } from '@ember/array';
import Ember from 'ember';
import { guidFor } from '@ember/object/internals';

module('Integration | Component | navi dashboard', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { owner } = this;

    owner.register(
      'helper:route-action',
      buildHelper(() => () => undefined),
      { instantiate: false }
    );

    const MockFragmentArray = class extends Array {
      get(key) {
        return get(this, key);
      }
    };

    const dashboardModel = {
      title: 'Test Dashboard',
      isUserOwner: true,
      widgets: [1, 2],
      presentation: {
        version: 1,
        layout: A([
          { column: 0, row: 0, height: 4, width: 3, widgetId: 1 },
          { column: 3, row: 0, height: 4, width: 6, widgetId: 2 },
          { column: 0, row: 5, height: 1, width: 1, widgetId: 123456 }, // Test a widget that doesn't exist
        ]),
        columns: 20,
        get(key) {
          return get(this, key);
        },
      },
      filters: new MockFragmentArray(),
      constructor: { modelName: 'dashboard' },
      get(key) {
        return get(this, key);
      },
    };

    this.set('dashboardModel', dashboardModel);
    this.set('onUpdateFilter', () => null);
    this.set('onRemoveFilter', () => null);
    this.set('onAddFilter', () => null);

    await owner.lookup('service:user').findUser();
    await owner.lookup('service:navi-metadata').loadMetadata();

    // Add some dashboard models to the store
    const store = owner.lookup('service:store');
    run(() => {
      store.createRecord('dashboard-widget', { id: 1, visualization: { type: 'table' } });
      store.createRecord('dashboard-widget', { id: 2, visualization: { type: 'table' } });
    });
  });

  test('it renders', async function (assert) {
    assert.expect(4);

    await render(hbs`<NaviDashboard
      @dashboard={{this.dashboardModel}}
      @onUpdateFilter={{this.onUpdateFilter}}
      @onRemoveFilter={{this.onRemoveFilter}}
      @onAddFilter={{this.onAddFilter}}
    />`);

    assert
      .dom('.dashboard-header__page-title')
      .hasText(this.dashboardModel.title, 'Component renders header with dashboard title');

    assert
      .dom('.grid-stack .grid-stack-item')
      .exists({ count: 2 }, 'Component renders a grid-stack-item for each widget, ignoring ones that do not exist');

    assert
      .dom(findAll('.grid-stack .grid-stack-item')[1])
      .hasAttribute('gs-x', '3', 'Widget x position is based on layout');

    assert.dom(findAll('.grid-stack .grid-stack-item')[1]).hasAttribute('gs-w', '6', 'Widget width is based on layout');
  });

  test('widget tasks', async function (assert) {
    assert.expect(2);

    const taskByWidget = {
      1: { isRunning: true },
      2: { isError: true, error: { details: [`It's 11:00pm. Do you know where your children are?`] } },
    };
    this.set('taskByWidget', taskByWidget);

    await render(hbs`
      <NaviDashboard
        @dashboard={{this.dashboardModel}}
        @taskByWidget={{this.taskByWidget}}
        @onUpdateFilter={{this.onUpdateFilter}}
        @onRemoveFilter={{this.onRemoveFilter}}
        @onAddFilter={{this.onAddFilter}}
      />
    `);

    function findComponentInstance(node, guid) {
      if (guidFor(node.instance) === guid) {
        return node.instance;
      }
      const { children = [] } = node;
      return children.map((c) => findComponentInstance(c, guid)).find((c) => c);
    }

    const renderTree = Ember._captureRenderTree(this.owner);

    findAll('.navi-widget').forEach((el) => {
      const guid = el.getAttribute('data-widget-guid');
      const widget = findComponentInstance(renderTree[0], guid);
      const { id } = widget.args.model;
      const { taskInstance } = widget.args;
      assert.equal(taskInstance, taskByWidget[id], 'widget gets matching model and task instance');
    });
  });

  test('dashboard export', async function (assert) {
    assert.expect(2);
    const originalFeatureFlag = config.navi.FEATURES.enableDashboardExport;

    config.navi.FEATURES.enableDashboardExport = true;
    await render(hbs`<NaviDashboard
      @dashboard={{this.dashboardModel}}
      @onUpdateFilter={{this.onUpdateFilter}}
      @onRemoveFilter={{this.onRemoveFilter}}
      @onAddFilter={{this.onAddFilter}}
    />`);

    assert.dom('.dashboard-header__export-btn').isVisible('Dashboard export button should be visible');

    config.navi.FEATURES.enableDashboardExport = false;
    await render(hbs`<NaviDashboard
      @dashboard={{this.dashboardModel}}
      @onUpdateFilter={{this.onUpdateFilter}}
      @onRemoveFilter={{this.onRemoveFilter}}
      @onAddFilter={{this.onAddFilter}}
    />`);
    assert.dom('.dashboard-header__export-btn').isNotVisible('Dashboard export button should not be visible');

    config.navi.FEATURES.enableDashboardExport = originalFeatureFlag;
  });

  test('dashboard schedule - config', async function (assert) {
    assert.expect(2);
    const originalFeatureFlag = config.navi.FEATURES.enableScheduleDashboards;

    config.navi.FEATURES.enableScheduleDashboards = true;
    await render(hbs`<NaviDashboard
      @dashboard={{this.dashboardModel}}
      @onUpdateFilter={{this.onUpdateFilter}}
      @onRemoveFilter={{this.onRemoveFilter}}
      @onAddFilter={{this.onAddFilter}}
    />`);
    assert.dom('.dashboard-header__schedule-btn').isVisible('Dashboard schedule button should be visible');

    config.navi.FEATURES.enableScheduleDashboards = false;
    await render(hbs`<NaviDashboard
      @dashboard={{this.dashboardModel}}
      @onUpdateFilter={{this.onUpdateFilter}}
      @onRemoveFilter={{this.onRemoveFilter}}
      @onAddFilter={{this.onAddFilter}}
    />`);
    assert.dom('.dashboard-header__schedule-btn').isNotVisible('Dashboard schedule button should not be visible');

    config.navi.FEATURES.enableScheduleDashboards = originalFeatureFlag;
  });

  test('dashboard schedule - isUserOwner', async function (assert) {
    assert.expect(1);

    this.set('dashboardModel.isUserOwner', false);

    await render(hbs`<NaviDashboard
      @dashboard={{this.dashboardModel}}
      @onUpdateFilter={{this.onUpdateFilter}}
      @onRemoveFilter={{this.onRemoveFilter}}
      @onAddFilter={{this.onAddFilter}}
    />`);
    assert.dom('.schedule__modal').doesNotExist('Dashboard schedule button should not be visible');
  });
});
