import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { TestContext } from 'ember-test-helpers';

let metadataService: { loadMetadata: () => any };

module('Integration | Component | filter-builders/collapsed', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    const factory = this.owner.lookup('service:fragment-factory');
    metadataService = this.owner.lookup('service:navi-metadata');
    await metadataService.loadMetadata();
    this.set('displayName', 'Foo');
    this.set('filter', factory.createFilter('dimension', 'bardOne', 'Foo', {}, 'in', []));
    this.set('selectedOperator', { id: 'in', name: 'Equals', valuesComponent: 'mock/values-component' });
    this.owner.register(
      'component:mock/values-component',
      Component.extend({
        classNames: 'mock-value-component',
        layout: hbs`<div>Test</div>`
      })
    );
  });

  test('it renders', async function(assert) {
    await render(hbs`<FilterBuilders::Collapsed
      @displayName={{this.displayName}}
      @filter={{this.filter}}
      @field={{this.field}}
      @selectedOperator={{this.selectedOperator}} />`);

    assert.dom().hasText('Foo equals Test', 'Renders correctly without a field');
  });
});
