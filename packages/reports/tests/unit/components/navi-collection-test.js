import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('navi-collection', 'Unit | Component | navi collection', {
  unit: true
});

test('itemRoute and itemNewRoute', function(assert) {
  assert.expect(4);

  let component = this.subject({
    itemType: 'report'
  });

  assert.equal(component.get('itemRoute'),
    'reports.report',
    'itemRoute is computed based on itemType');

  assert.equal(component.get('itemNewRoute'),
    'reports.new',
    'itemNewRoute is computed based on itemType');

  component.set('config', {
    itemRoute: 'customReports.report',
    itemNewRoute: 'customReports.new'
  });

  assert.equal(component.get('itemRoute'),
    'customReports.report',
    'the itemRoute override in the config is used when available');

  assert.equal(component.get('itemNewRoute'),
    'customReports.new',
    'the itemNewRoute override in the config is used when available');

});
