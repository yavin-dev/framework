import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filter-builders/collapsed', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setProperties({
      displayName: 'Foo',
      filter: {
        operator: {
          id: 'in',
          name: 'Equals',
          valuesComponent: 'mock/values-component'
        }
      }
    });
    this.owner.register(
      'component:mock/values-component',
      Component.extend({
        classNames: 'mock-value-component',
        layout: hbs`<div>Test</div>`
      })
    );
  });

  test('it renders', async function(assert) {
    assert.expect(2);

    await render(hbs`<FilterBuilders::Collapsed
      @displayName={{this.displayName}}
      @filter={{this.filter}}
      @field={{this.field}} />`);

    assert.dom().hasText('Foo equals Test', 'Renders correctly without a field');

    this.set('field', 'desc');

    assert.dom().hasText('Foo (desc) equals Test', 'Renders correctly with a field');
  });
});
