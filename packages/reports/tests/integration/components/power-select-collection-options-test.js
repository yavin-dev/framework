import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Power Select Collection Options', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('options', [{ id: 1, name: 'foo' }, { id: 2, name: 'bar' }, { id: 3, name: 'baz' }]);

    this.set('select', {
      actions: {
        highlighted: () => null,
        scrollTo: () => null
      }
    });
  });

  test('it renders - with clear selection', async function(assert) {
    assert.expect(1);

    await render(hbs`
          {{#power-select-collection-options
              extra=(hash allowClear=true)
              options=options
              select=select
          as |item| }}
              {{item.name}}
          {{/power-select-collection-options}}
      `);

    assert.deepEqual(
      this.$('.ember-power-select-option')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      ['Clear Selection', ...this.get('options').map(o => o.name)],
      'it renders a list of options with clear selection'
    );
  });

  test('it renders - without clear selection', async function(assert) {
    assert.expect(1);

    await render(hbs`
          {{#power-select-collection-options
              options=options
              select=select
          as |item| }}
              {{item.name}}
          {{/power-select-collection-options}}
      `);

    assert.deepEqual(
      this.$('.ember-power-select-option')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      this.get('options').map(o => o.name),
      'it renders a list of options without clear selection'
    );
  });
});
