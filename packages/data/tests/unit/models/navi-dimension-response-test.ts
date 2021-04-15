import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import NaviDimensionResponse from 'navi-data/models/navi-dimension-response';

module('Unit | Model | navi dimension response', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const response = NaviDimensionResponse.create();
    assert.deepEqual(response.values, [], 'Stores dimension values');
    assert.deepEqual(response.meta, {}, 'Stores meta information');
  });
});
