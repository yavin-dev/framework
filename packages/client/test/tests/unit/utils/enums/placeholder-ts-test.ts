import { module, test } from 'qunit';
import Card from '@yavin/client/utils/enums/cardinality-sizes';

module('Unit | Utils | Enums | Cardinality Sizes in TS', function () {
  test('imports', async function (assert) {
    assert.strictEqual(Card.length, 3, 'test example');
  });
});
