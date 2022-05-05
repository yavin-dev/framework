import { currentURL, find, visit } from '@ember/test-helpers';
import Ember from 'ember';
import Mirage from 'ember-cli-mirage';
import config from 'ember-get-config';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

const SERIALIZED_MODEL =
  'N4IgJghgLhIFygJZniAjAVhAGhNKATogEYCuUApgM7yhSJQA2FqAEgJ4GnMAEAchQDuNXAQoBHUtSi0QAM0SNKBGnADaoAPYAHCgWiaCqYhRm4AbhEZTVakAAUATABEcIAMakCYgHYyAurgKFIwocCA+poKGANYAdJCUACqIALYsuNoQ+unKqqAA5vqIPqiQ7CAAvrhQ7Lqo9OnOaRQ+VIiapZWBHprWqW3wGh7IqADSAKoAQgBaAOKkACyCBQCyblaIEKo+3IxBiCFhEVGxCdAUKeluWTmmevkgRRAlZRAV1SC19eGNFM3pNodLrYUDuUbhUgACww7AAHAB2ADyAFEZgBJDaMLY7PYHI6oSJQaIEGIAZWo7U6IhAtwguQetE+3xY4VyRHcVR6MGIzEJp1Jbiohigth62NSDHgu0Y+xAYkk0gAag9gahHHEAAxuRIQMmaLzuVkgYjZMBIyJVCyIKikTYAL2gaoQXzqxuxkQAtO4odkzCBzKrOvBHLhchBdbIqLU+QhPhAAB422QVF1UPSHR4s1DsxCc3DuToKApMypl8uiEJO6lQxDaR4QchQwyySMu7OQ9MqNwQiIQcyIAD6pC7VTLNTdqDE2hFNDLQA';

module('Acceptance | print report', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('print reports index', async function (assert) {
    assert.expect(1);
    await visit('/print/reports/1');

    assert.equal(currentURL(), '/print/reports/1/view', 'Redirect to view sub route');
  });

  test('print reports view', async function (assert) {
    await visit('/print/reports/14/view');

    assert.dom('.navi-report__title').hasText('RequestV2 multi-param testing report', 'Should show report title');

    assert.dom('.print-report-view__visualization').isVisible('Should show report visualization');

    assert.dom('.print-report-view__visualization-header').isNotVisible('Should not show report visualization header');
    assert.deepEqual(
      [...document.querySelectorAll('.table-header-cell')].map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Give me params (EUR,6)', 'Property (id)'],
      'The legend fills in with widget dimensions'
    );
  });

  test('print reports error', async function (assert) {
    assert.expect(1);

    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.get('/data/*path', () => {
      return new Mirage.Response(400, {}, { description: 'Cannot merge mismatched time grains month and day' });
    });

    //suppress errors and exceptions for this test
    let originalLoggerError = Ember.Logger.error,
      originalException = Ember.Test.adapter.exception;

    Ember.Logger.error = function () {};
    Ember.Test.adapter.exception = function () {};

    await visit('/print/reports/5');
    assert.equal(
      find('.routes-reports-report-error').innerText.replace(/\s+/g, ' ').trim(),
      'There was an error with your request. Cannot merge mismatched time grains month and day',
      'An error message is displayed for an invalid request'
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });

  test('print reports invalid', async function (assert) {
    assert.expect(1);
    await visit('/print/reports/6');

    assert.equal(currentURL(), '/print/reports/6/invalid', 'Redirect to invalid sub route');
  });

  test('print url provided report', async function (assert) {
    assert.expect(2);

    await visit(`/print/reports/new?model=${SERIALIZED_MODEL}`);

    assert
      .dom('.navi-report__title')
      .hasText('Hyrule News', 'The report title passed through the model query param is visible');

    assert
      .dom('.line-chart-widget')
      .isVisible('The visualization type passed through the model query param is visible');
  });
});
