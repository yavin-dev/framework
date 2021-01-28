import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`<NaviEmailTag @tag={{this.email}} />`;

module('Integration | Component | navi email tag', function(hooks) {
  setupRenderingTest(hooks);

  test('valid email address', async function(assert) {
    assert.expect(1);

    this.set('email', 'link@naviapp.io');

    await render(TEMPLATE);

    assert.dom('.tag').doesNotHaveClass('is-disabled', 'Tag containing a valid email is not given the disabled class');
  });

  test('invalid email address', async function(assert) {
    this.set('email', 'abcdefg');
    await render(TEMPLATE);
    assert.dom('.tag').hasClass('is-disabled', 'Tag containing an invalid email is given the disabled class');
  });
});
