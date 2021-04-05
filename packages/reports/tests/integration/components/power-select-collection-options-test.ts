import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import type { TestContext as Context } from 'ember-test-helpers';
import type PowerSelectCollectionOptions from 'navi-reports/components/power-select-collection-options';

const TEMPLATE = hbs`
<PowerSelectCollectionOptions
  id="ember-power-select-options-{{this.select.uniqueId}}"
  @extra={{hash allowClear=this.allowClear sortFn=this.sortFn sortKey=this.sortKey}}
  @options={{this.options}}
  @select={{this.select}}
  as |item|>
  {{item.name}}
</PowerSelectCollectionOptions>
`;

type ComponentArgs = PowerSelectCollectionOptions['args'];
type ExtraArgs = ComponentArgs['extra'] & {};
interface TestContext extends Context, ExtraArgs {
  options: ComponentArgs['options'];
}

module('Integration | Component | Power Select Collection Options', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    this.set('options', [
      { id: 1, name: 'foo' },
      { id: 3, name: 'baz' },
      { id: 2, name: 'bar' },
    ]);

    this.set('select', {
      actions: {
        highlighted: () => null,
        scrollTo: () => null,
      },
      uniqueId: 'very-unique-id',
    });
  });

  test('it renders - with clear selection', async function (this: TestContext, assert) {
    assert.expect(1);

    this.allowClear = true;
    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent?.trim()),
      ['Clear Selection', ...this.options.map((o) => o.name)],
      'it renders a list of options with clear selection'
    );
  });

  test('it renders - without clear selection', async function (this: TestContext, assert) {
    assert.expect(1);

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent?.trim()),
      this.options.map((o) => o.name),
      'it renders a list of options without clear selection'
    );
  });

  test('sortKey is used', async function (this: TestContext, assert) {
    assert.expect(1);

    this.sortKey = 'name';
    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent?.trim()),
      ['bar', 'baz', 'foo'],
      'it sorts the list of options using the sortKey'
    );
  });

  test('sortFn is called', async function (this: TestContext, assert) {
    assert.expect(3);

    const option = 'Sort Returned';
    this.sortFn = () => {
      assert.step('sortFn');
      return [{ option: { name: option }, idx: 0 }];
    };

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent?.trim()),
      [option],
      'it sorts the list of options using the sortFn'
    );

    assert.verifySteps(['sortFn'], 'sortFn is called');
  });
});
