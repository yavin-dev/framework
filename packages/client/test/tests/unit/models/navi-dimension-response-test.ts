import { module, test } from 'qunit';
import NaviDimensionResponse from '@yavin/client/models/navi-dimension-response';
import { nullInjector } from '../../helpers/injector';

module('Unit | Model | navi dimension response', function () {
  test('it exists', function (assert) {
    //@ts-expect-error
    const response = new NaviDimensionResponse(nullInjector, undefined);
    assert.deepEqual(response.values, [], 'Stores dimension values');
    assert.deepEqual(response.meta, {}, 'Stores meta information');
  });
});
