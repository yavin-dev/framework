import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { createGlimmerComponent } from 'navi-core/test-support';
import type NaviCollection from 'navi-reports/components/navi-collection';

module('Unit | Component | navi collection', function (hooks) {
  setupTest(hooks);

  test('itemRoute and itemNewRoute', function (assert) {
    assert.expect(4);

    const component: NaviCollection = createGlimmerComponent('component:navi-collection', { itemType: 'report' });

    assert.equal(component.itemRoute, 'reports.report', 'itemRoute is computed based on itemType');

    assert.equal(component.itemNewRoute, 'reports.new', 'itemNewRoute is computed based on itemType');

    component.args.config = {
      itemRoute: 'customReports.report',
      itemNewRoute: 'customReports.new',
    };

    assert.equal(
      component.itemRoute,
      'customReports.report',
      'the itemRoute override in the config is used when available'
    );

    assert.equal(
      component.itemNewRoute,
      'customReports.new',
      'the itemNewRoute override in the config is used when available'
    );
  });
});
