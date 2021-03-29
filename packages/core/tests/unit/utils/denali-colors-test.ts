import { module, test } from 'qunit';
import { fetchColor } from 'navi-core/utils/denali-colors';

module('Unit | Utils | Denali Colors', () => {
  test('fetchColor assigns correct colors in correct order', (assert) => {
    assert.deepEqual(fetchColor(5), '#0072df', 'defaults to graph colors');
    assert.deepEqual(fetchColor(2, 'status'), '#15c046', 'responds to status colors');
    assert.deepEqual(fetchColor(5, 'status'), '#f4cb00', 'wraps through status colors correctly');
    assert.deepEqual(fetchColor(25), '#0072df', 'wraps through graph colors correctly');
  });
});
