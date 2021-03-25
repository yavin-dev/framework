import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
<PowerSelectCollectionOptions
  @extra={{hash allowClear=this.allowClear sortFn=this.sortFn sortKey=this.sortKey}}
  @options={{this.options}}
  @select={{this.select}}
  as |item|>
  {{item.name}}
</PowerSelectCollectionOptions>
`;

module('Integration | Component | Power Select Collection Options', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('options', [
      { id: 1, name: 'foo' },
      { id: 2, name: 'bar' },
      { id: 3, name: 'baz' }
    ]);

    this.set('select', {
      actions: {
        highlighted: () => null,
        scrollTo: () => null
      }
    });
  });

  test('it renders - with clear selection', async function(assert) {
    assert.expect(1);

    this.allowClear = true;
    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.ember-power-select-option').map(el => el.textContent?.trim()),
      ['Clear Selection', ...this.get('options').map(o => o.name)],
      'it renders a list of options with clear selection'
    );
  });

  test('it renders - without clear selection', async function(assert) {
    assert.expect(1);

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.ember-power-select-option').map(el => el.textContent?.trim()),
      this.options.map(o => o.name),
      'it renders a list of options without clear selection'
    );
  });
});
