import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let Adapter;

module('Unit | metadata/column', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Adapter = this.owner.lookup('adapter:metadata/metric'); // metric and dimension both use column metadata adapter
  });

  test('buildURLId', function(assert) {
    assert.equal(Adapter.buildURLId('tableName.dimensionName'), 'dimensionName', 'String after "." is returned');

    assert.equal(
      Adapter.buildURLId('dimensionName'),
      'dimensionName',
      'When id does not contain ".", whole id is returned'
    );

    assert.equal(
      Adapter.buildURLId('namespace.tableName.metricName'),
      'metricName',
      'Final substring is returned after "."'
    );
  });
});
