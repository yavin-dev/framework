import { module, test } from 'qunit';
import { find, visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | dir sidebar', function(hooks) {
  setupApplicationTest(hooks);

  test('transitions for sidebar groups', async function(assert) {
    assert.expect(2);
    
    await visit('/directory');
    assert.equal(currentURL(), 
      '/directory/my-directory',
      'Directory route redirects to `my-directory` child route');
    assert.equal(find('.dir-sidebar__group.active').textContent.trim(),
      'My Directory',
      'The active sidebar link corresponds to the active route');
  });
});
