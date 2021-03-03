import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import FragmentFactory from 'navi-core/services/fragment-factory';
import RangeInput from 'navi-reports/components/filter-values/range-input';

type ComponentArgs = RangeInput['args'];
interface TestContext extends Context, ComponentArgs {
  fragmentFactory: FragmentFactory;
}

module('Integration | Component | filter values/null input', function (hooks) {
  setupRenderingTest(hooks);
  test('onUpdateFilter - non empty values', async function (this: TestContext, assert) {
    assert.expect(0);

    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.filter = fragmentFactory.createFilter('metric', 'bardOne', 'adClicks', {}, 'bet', [1000, 2000]);
    this.onUpdateFilter = () => {
      assert.ok(false, 'No action is fired off');
    };

    await render(hbs`
      <FilterValues::NullInput
        @filter={{this.filter}}
        @onUpdateFilter={{this.onUpdateFilter}}
      />`);
  });
});
