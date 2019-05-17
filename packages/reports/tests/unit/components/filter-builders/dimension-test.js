import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | filter-builders/dimension', function(hooks) {
  setupTest(hooks);

  test('filter property', function(assert) {
    assert.expect(3);

    const mockFilterFragment = {
      dimension: { longName: 'age' },
      operator: 'notnull',
      rawValues: [1, 2, 3]
    };

    let dimBuilder = this.owner
      .factoryFor('component:filter-builders/dimension')
      .create({ requestFragment: mockFilterFragment });

    assert.deepEqual(
      dimBuilder.get('filter.subject'),
      mockFilterFragment.dimension,
      'Filter subject matches the dimension from the request fragment'
    );

    assert.deepEqual(
      dimBuilder.get('filter.operator'),
      A(dimBuilder.get('supportedOperators')).findBy('id', mockFilterFragment.operator),
      'Filter operator matches the supported operator object with the id from the request fragment'
    );

    assert.deepEqual(
      dimBuilder.get('filter.values'),
      mockFilterFragment.rawValues,
      'Filter values match the rawValues property in the request fragment'
    );
  });
});
