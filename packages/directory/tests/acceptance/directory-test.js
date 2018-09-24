import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | directory', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /directory', async function(assert) {
    assert.expect(1);
    
    await visit('/directory');
    assert.equal(currentURL(), '/directory/my-data', 
      'Directory route redirects to `my-data` automatically');
  });
});
