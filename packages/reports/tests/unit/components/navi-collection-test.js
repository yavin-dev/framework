import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | navi collection', function(hooks) {
  setupTest(hooks);

  test('itemRoute and itemNewRoute', function(assert) {
    assert.expect(4);

    let component = this.owner.factoryFor('component:navi-collection').create({
      itemType: 'report'
    });

    assert.equal(component.get('itemRoute'), 'reports.report', 'itemRoute is computed based on itemType');

    assert.equal(component.get('itemNewRoute'), 'reports.new', 'itemNewRoute is computed based on itemType');

    component.set('config', {
      itemRoute: 'customReports.report',
      itemNewRoute: 'customReports.new'
    });

    assert.equal(
      component.get('itemRoute'),
      'customReports.report',
      'the itemRoute override in the config is used when available'
    );

    assert.equal(
      component.get('itemNewRoute'),
      'customReports.new',
      'the itemNewRoute override in the config is used when available'
    );
  });
});
