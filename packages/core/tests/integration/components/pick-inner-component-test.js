import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | pick inner component', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    // Create an extended component for testing since pick-inner-component can't be used directly
    let innerComponent = this.owner.__container__.factoryFor('component:pick-inner-component').class,
      testComponent = innerComponent.extend({
        componentName: 'extended-component'
      });

    this.owner.register('component:extended-component', testComponent);
  });

  test('Yields inner template', async function(assert) {
    assert.expect(1);

    await render(hbs`
          {{#pick-container}}
              {{#extended-component}}
                  <div id='should-be-found'>My div</div>
              {{/extended-component}}
          {{/pick-container}}
      `);

    assert.dom('#should-be-found').hasText('My div', 'Inner template renders');
  });
});
