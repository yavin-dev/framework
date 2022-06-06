import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import NaviDimensionResponse from '@yavin/client/models/navi-dimension-response';

module('Unit | Model | navi dimension response', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    //@ts-expect-error
    const response = new NaviDimensionResponse(this.owner.lookup('service:client-injector'), undefined);
    assert.deepEqual(response.values, [], 'Stores dimension values');
    assert.deepEqual(response.meta, {}, 'Stores meta information');
  });
});
