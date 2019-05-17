import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let Template;

module('Integration | Component | common actions/buttonize', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    Template = hbs`
        {{#common-actions/buttonize}}
          Buttonize component
        {{/common-actions/buttonize}}
      `;
  });

  test('buttonize component renders', async function(assert) {
    assert.expect(1);

    await render(Template);

    assert.dom('.action').hasText('Buttonize component', 'Buttonize component is yielded');
  });
});
