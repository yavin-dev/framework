import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
// import { settled } from '@ember/test-helpers';

module('Unit | Service | navi-report-search-provider', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    // Load metadata needed for request fragment
    await this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const service = this.owner.lookup('service:navi-search/navi-report-search-provider');
    assert.ok(service);
  });

  test('search by user', async function(assert) {
    const service = this.owner.lookup('service:navi-search/navi-report-search-provider');
    const results = await service.search({ title: 'Hyrule', request: 'clicks' }, 'navi_user');
    const author = await results.get('firstObject.author.id');
    assert.ok(results.get('firstObject').title.includes('Hyrule'));
    assert.ok(
      JSON.stringify(results.get('firstObject').request)
        .toLowerCase()
        .includes('click')
    );
    assert.ok(author.includes('navi_user'));
  });

  test('search any user', async function(assert) {
    const service = this.owner.lookup('service:navi-search/navi-report-search-provider');
    const results = await service.search({ title: 'Hyrule', request: 'clicks' });
    assert.ok(results.get('firstObject').title.includes('Hyrule'));
    assert.ok(
      JSON.stringify(results.get('firstObject').request)
        .toLowerCase()
        .includes('click')
    );
  });
});
