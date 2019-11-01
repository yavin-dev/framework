import { module, test } from 'qunit';
import { click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | navi notifications', function(hooks) {
  setupApplicationTest(hooks);

  test('navi-notifications', async function(assert) {
    await visit('/');

    assert.dom('.alert').doesNotExist('initially there are not alerts shown');

    await click('.success-btn');
    assert.dom('.alert-success').exists('success alert is shown');

    await click('.info-btn');
    assert.dom('.alert-info').exists('info alert is shown');

    await click('.danger-btn');
    assert.dom('.alert-danger').exists('danger alert is shown');

    await click('.danger-btn');
    assert.dom('.alert').exists({ count: 3 }, 'messages are deduplicated');

    await click('.clear-btn');
    assert.dom('.alert').doesNotExist('clearMessages clears the message queue');
  });
});
