import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import FragmentFactory from 'navi-core/services/fragment-factory';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import InvalidValue from 'navi-reports/components/filter-values/invalid-value';

type ComponentArgs = InvalidValue['args'];
interface TestContext extends Context, ComponentArgs {}

module('Integration | Component | filter values/invalid value', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(this: TestContext, assert) {
    assert.expect(1);

    this.fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.filter = this.fragmentFactory.createFilter('dimension', 'bardOne', 'age', { field: 'id' }, 'in', []);
    this.set('filter.values', undefined);
    await render(hbs`<FilterValues::InvalidValue @filter={{this.filter}} />`);

    assert.dom('.filter-values--selected-error').exists();
  });
});
