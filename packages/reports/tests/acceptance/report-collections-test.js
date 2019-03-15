import { click, findAll, currentURL, visit } from '@ember/test-helpers';
import Ember from 'ember';
import { module, test } from 'qunit';
import { teardownModal } from '../helpers/teardown-modal';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let OriginalLoggerError, OriginalTestAdapterException;

module('Acceptance | Report Collections', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.afterEach(function() {
    teardownModal();
  });

  test('report-collection success', async function(assert) {
    assert.expect(2);

    await visit('/report-collections/1');
    assert.notOk(!!findAll('.error').length, 'Error message not present when route is successfully loaded');

    assert.ok(
      !!findAll('.navi-collection').length,
      'the report collection component is rendered when route is successfully loaded'
    );
  });

  test('report-collection error', async function(assert) {
    assert.expect(2);

    // Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
    OriginalLoggerError = Ember.Logger.error;
    OriginalTestAdapterException = Ember.Test.adapter.exception;
    Ember.Logger.error = function() {};
    Ember.Test.adapter.exception = function() {};

    server.get('/reportCollections/:id', { errors: ['The report-collections endpoint is down'] }, 500);

    await visit('/report-collections/1');
    assert.ok(!!findAll('.error').length, 'Error message is present when route encounters an error');

    assert.notOk(!!findAll('.navi-collection').length, 'Navi report collection component is not rendered');

    Ember.Logger.error = OriginalLoggerError;
    Ember.Test.adapter.exception = OriginalTestAdapterException;
  });

  test('report-collection link', async function(assert) {
    assert.expect(1);
    await visit('/report-collections/1');
    await click('.navi-collection table > tbody > tr > td > a');
    const urlRe = /\/reports\/\d+\/view/;
    assert.ok(urlRe.test(currentURL()), 'Navigate to the report when link is clicked');
  });

  test('report-collection loading', async function(assert) {
    assert.expect(1);

    await visit('/report-collections/loading');

    assert.ok(!!findAll('.navi-loader__container').length, 'Loader is present when visiting loading route');
  });
});
