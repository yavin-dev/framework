import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'ember-cli-mirage';

module('Acceptance | Dashboard Collections', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('dashboard-collection index', async function(assert) {
    assert.expect(3);

    await visit('/dashboard-collections');
    assert.dom('.error').doesNotExist('Error message not present when route is successfully loaded');

    assert
      .dom('.navi-collection')
      .exists('the dashboard collection component is rendered when route is successfully loaded');

    assert.dom('.navi-collection__row').exists({ count: 3 }, 'The dashboard collection shows 3 collections');
  });

  test('dashobard-collection success', async function(assert) {
    assert.expect(2);

    await visit('/dashboard-collections/1');
    assert.dom('.error').doesNotExist('Error message not present when route is successfully loaded');

    assert
      .dom('.navi-collection')
      .exists('the dashboard collection component is rendered when route is successfully loaded');
  });

  test('dashboard-collection error', async function(assert) {
    assert.expect(2);

    server.get('/dashboardCollections/:id', () => new Response(500));

    await visit('/dashboard-collections/1');
    assert.dom('.error').exists('Error message is present when route encounters an error');

    assert.dom('.navi-collection').doesNotExist('Navi dashboard collection component is not rendered');
  });

  test('dashboard-collection loading', async function(assert) {
    assert.expect(1);

    await visit('/dashboard-collections/loading');

    assert.dom('.loader-container').exists('Loader is present when visiting loading route');
  });
});
