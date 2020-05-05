import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | filter-builders/dimension', function(hooks) {
  setupTest(hooks);

  test('filter property', function(assert) {
    assert.expect(3);

    const mockFilterFragment = {
      dimension: { name: 'age' },
      operator: 'notnull',
      rawValues: [1, 2, 3]
    };

    let dimBuilder = this.owner
      .factoryFor('component:filter-builders/dimension')
      .create({ requestFragment: mockFilterFragment });

    assert.deepEqual(
      mockFilterFragment.dimension,
      dimBuilder.filter.subject,
      'Filter subject matches the dimension from the request fragment'
    );

    assert.deepEqual(
      A(dimBuilder.supportedOperators).findBy('id', mockFilterFragment.operator),
      dimBuilder.filter.operator,
      'Filter operator matches the supported operator object with the id from the request fragment'
    );

    assert.deepEqual(
      mockFilterFragment.rawValues,
      dimBuilder.filter.values,
      'Filter values match the rawValues property in the request fragment'
    );
  });
});
