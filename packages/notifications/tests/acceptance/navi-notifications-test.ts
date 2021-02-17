import { module, test } from 'qunit';
import { click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';

module('Acceptance | navi notifications', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);

  test('navi-notifications', async function (assert) {
    await visit('/');

    assert.dom('.alert').doesNotExist('initially there are not alerts shown');

    await click('.default-btn');
    await animationsSettled();
    assert.dom('.alert').exists('default alert is shown');
    assert.dom('.alert').doesNotHaveClass(/is-/, 'default alert is shown');
    assert.dom('.alert h5').hasText('default title', 'default title is correct');
    assert.dom('.alert p').hasText('default context', 'default context is correct');
    assert.dom('.alert .d-icon').doesNotHaveClass(/^((?!d-icon).)*$/, 'default alert as no icon');

    await click('.success-btn');
    await animationsSettled();
    assert.dom('.alert.is-success').exists('success alert is shown');
    assert.dom('.alert.is-success h5').hasText('success title', 'success title is correct');
    assert.dom('.alert.is-success p').hasText('success context', 'success context is correct');
    assert.dom('.alert.is-success .d-icon').hasClass('d-check-circle', 'success icon is correct');

    await click('.info-btn');
    await animationsSettled();
    assert.dom('.alert.is-info').exists('info alert is shown');
    assert.dom('.alert.is-info h5').hasText('info title', 'info title is correct');
    assert.dom('.alert.is-info p').hasText('info context', 'info context is correct');
    assert.dom('.alert.is-info .d-icon').hasClass('d-information-circle', 'info icon is correct');

    await click('.warning-btn');
    await animationsSettled();
    assert.dom('.alert.is-warning').exists('warn alert is shown');
    assert.dom('.alert.is-warning h5').hasText('warning title', 'warning title is correct');
    assert.dom('.alert.is-warning p').hasText('warning context', 'warning context is correct');
    assert.dom('.alert.is-warning .d-icon').hasClass('d-warning', 'warning icon is correct');

    await click('.danger-btn');
    await animationsSettled();
    assert.dom('.alert.is-danger').exists('danger alert is shown');
    assert.dom('.alert.is-danger h5').hasText('danger title', 'danger title is correct');
    assert.dom('.alert.is-danger p').hasText('danger context', 'danger context is correct');
    assert.dom('.alert.is-danger .d-icon').hasClass('d-stop-warning', 'danger icon is correct');

    await click('.clear-btn');
    await animationsSettled();
    assert.dom('.alert').doesNotExist('clearMessages clears the message queue');
  });

  test('close notification', async function (assert) {
    await visit('/');
    //set no timeout
    await click('[data-timeout="none"]');

    //create notification
    await click('.default-btn');
    await animationsSettled();
    assert.dom('.alert').exists('default alert is shown');

    //close notification
    await click('.d-close');
    await animationsSettled();
    assert.dom('.alert').doesNotExist('alert close button removes the alert');
  });
});
