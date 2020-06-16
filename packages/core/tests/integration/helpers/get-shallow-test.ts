import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | get-shallow', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(3);

    this.set('object', {
      'foo.bar': 'baz',
      foo: {
        bar: 'wrong'
      },
      buzz: 'bang'
    });

    this.set('key', 'foo.bar');

    await render(hbs`{{get-shallow this.object this.key}}`);

    assert.dom().hasText('baz', 'Key with period in it is used correctly');

    this.set('key', 'buzz');
    assert.dom().hasText('bang', 'Key without period in it is used correctly');

    this.set('key', 'invalid');
    assert.dom().hasText('', 'No value returned when key is not present on object');
  });
});
