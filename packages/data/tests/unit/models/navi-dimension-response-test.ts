import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import type NaviDimensionResponse from 'navi-data/models/navi-dimension-response';
import type { Factory } from 'navi-data/models/native-with-create';

module('Unit | Model | navi dimension response', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const responseFactory = this.owner.factoryFor('model:navi-dimension-response') as Factory<
      typeof NaviDimensionResponse
    >;
    const response = responseFactory.create();
    assert.deepEqual(response.values, [], 'Stores dimension values');
    assert.deepEqual(response.meta, {}, 'Stores meta information');
  });
});
