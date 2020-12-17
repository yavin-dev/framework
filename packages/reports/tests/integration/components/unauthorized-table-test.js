import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

let MetadataService, Store;

module('Integration | Component | unauthorized table', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(2);

    MetadataService = this.owner.lookup('service:navi-metadata');
    Store = this.owner.lookup('service:store');

    await MetadataService.loadMetadata();
    const model = {
      request: Store.createFragment('bard-request-v2/request', { table: 'protected' })
    };

    this.set('model', model);

    await render(hbs`
      {{unauthorized-table report=model}}
    `);

    assert.dom('.fa-lock').isVisible('Lock icon is visible');

    assert
      .dom('.navi-report-invalid__unauthorized')
      .includesText('Protected Table', "Displays table name they don't have access to");
  });
});
