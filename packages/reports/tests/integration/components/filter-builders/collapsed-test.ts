import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { TestContext } from 'ember-test-helpers';
import NaviMetadataService from 'navi-data/services/navi-metadata';

let metadataService: NaviMetadataService;

module('Integration | Component | filter-builders/collapsed', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    const factory = this.owner.lookup('service:fragment-factory');
    metadataService = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await metadataService.loadMetadata();
    this.set('filter', factory.createFilter('dimension', 'bardOne', 'userDeviceType', {}, 'in', []));
    this.set('selectedValueBuilder', { operator: 'in', name: 'Equals', component: 'mock/values-component' });
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
      @filter={{this.filter}}
      @field={{this.field}}
      @selectedValueBuilder={{this.selectedValueBuilder}} />`);

    assert.dom().hasText('User Device Type equals Test', 'Renders correctly without a field');
  });
});
