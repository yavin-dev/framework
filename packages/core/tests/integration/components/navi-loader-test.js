import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | navi loader', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(4);

    await render(hbs`{{navi-loader
          containerClass='test-container'
      }}`);

    assert.dom('.navi-loader__container').exists('The loader container is rendered');

    assert.dom('.navi-loader__container.test-container').exists('The loader container is given the specified class');

    assert.dom('.navi-loader__spinner').exists('The loader spinner is rendered');

    assert.dom('.navi-loader__bounce').exists({ count: 3 }, 'Three loader bounce elements are rendered');
  });
});
