import { module, test } from 'qunit';
import { currentURL, fillIn, triggerEvent, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | dir search bar', function(hooks) {
  setupApplicationTest(hooks);

  test('query param changes as search query is entered', async function(assert) {
    assert.expect(2);

    let fillInText = 'testString';
    
    await visit('/directory');
    assert.equal(currentURL(),
      '/directory/my-directory',
      'The url matches the current route and has no queryparams set initially');

    await fillIn('.dir-search-bar__input', fillInText);
    await triggerEvent('.dir-search-bar__input', 'keyup');
    assert.equal(currentURL(),
      '/directory/my-directory?q=testString',
      'The url has the updated queryparam `q` when the search query is entered in the search bar');
  });
});
