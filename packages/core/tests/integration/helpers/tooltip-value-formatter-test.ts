import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import type FragmentFactory from 'navi-core/services/fragment-factory';

interface TestContext {
  fragmentFactory: FragmentFactory;
}

module('Integration | Helper | tooltip-value-formatter', function (this: TestContext, hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: FragmentFactory) {
    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardOne' });
    this.fragmentFactory = this.owner.lookup('service:fragment-factory');
  });

  test('makes a call to smart-format-number by default', async function (this: FragmentFactory, assert) {
    this.set('inputValue', '1234');
    this.set('metric', this.fragmentFactory.createColumn('metric', 'bardOne', 'uniqueIdentifier', {}));
    this.set('row', {});

    await render(hbs`{{tooltip-value-formatter inputValue metric row}}`);

    assert.dom().hasText('1,234', 'Formatted number is returned');

    this.set('inputValue', null);

    assert.dom().hasText('--', 'null returns blank value');

    this.set('inputValue', undefined);

    assert.dom().hasText('--', 'undefined returns blank value');

    this.set('inputValue', '');

    assert.dom().hasText('--', 'empty string returns blank value');
  });
});
