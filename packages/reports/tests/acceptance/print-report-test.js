import Ember from 'ember';
import Mirage from 'ember-cli-mirage';
import config from 'ember-get-config';
import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

const SERIALIZED_MODEL = 'EQbwOsAmCGAu0QFzmAS0kiBGCAaCcsATqgEYCusApgM5IoBuqN50ANqgF5yoD2AdvQiwAngAcqmYB35UAtAGMAFtCKw8EBlSI0-g4Iiz5gAWyrwY8IcGgAPZtZHWa21LWuiJUyKjP9dAhrACgIAZqgA5tZmxKgKUtCQAMIcCgDWdMDGPn4B_ADyRJDaSADaEGJEvBJqTsAAutm-VP56mYilKPzQZlIAClU1ogAEOFma7OTuBiiV1dqiUlhYACwQAL7ruF09kgYQA_O1wwBMQQyT08gVgwt1iNgADM-PY5vbEN29-8CHQyLDADM50u7Vmt1qSxejzOwE29U2iK2wlQsDYewewAAEiIiOR0cMAHJUADumWMRCoAEcpjR1DMIGxeBE4uwACrQUjojyc7k_WSwEm8IhpIKwZoAcSI0FQ-kxMDqyNM5hICnanQgMVVCWSqQyGw-yti8X50AYKTi-rhjQgORaeXVKDtrUCPzm_w2NuA4TY1B0ZS9KiY_CiBlKXpowvpHRQWriUm65r15NtqEpCnFrsx0BoJvWXtlfoubEdEDpqmjEBOrwArHJlnJHgBOYbPRBt54AOheQRaGB-1awdYbWAAbK3Hu3J12e9bjKRVJAAGraPJSBhjCnU2mwFc6PTrt5KylsHgCGhKVBiMEEShKYXWSwIBnATwYiDkFz-8ZofuYxOoAA-p-JRwu8wjiO-wCUmIUaZJswBAAA';

moduleForAcceptance('Acceptance | print report');

test('print reports index', function(assert) {
  assert.expect(1);
  visit('/print/reports/1');

  andThen(function() {
    assert.equal(currentURL(),
      '/print/reports/1/view',
      'Redirect to view sub route');
  });
});

test('print reports view', function(assert) {
  assert.expect(3);
  visit('/print/reports/1/view');

  andThen(function() {
    assert.equal(find('.navi-report__title').text().trim(),
      'Hyrule News',
      'Should show report title');

    assert.ok(find('.print-report-view__visualization').is(':visible'),
      'Should show report visualization');

    assert.notOk(find('.print-report-view__visualization-header').is(':visible'),
      'Should not show report visualization header');
  });
});

test('print reports error', function (assert) {
  assert.expect(1);

  server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
  server.get('/data/*path', () => {
    return new Mirage.Response(
      400,
      {},
      { description: 'Cannot merge mismatched time grains month and day' }
    );
  });

  //suppress errors and exceptions for this test
  let originalLoggerError = Ember.Logger.error,
      originalException = Ember.Test.adapter.exception;

  Ember.Logger.error = function () { };
  Ember.Test.adapter.exception = function () { };

  visit('/print/reports/5');
  andThen(() => {
    assert.equal($('.navi-report-error__info-message').text().replace(/\s+/g, " ").trim(),
      'Oops! There was an error with your request. Cannot merge mismatched time grains month and day',
      'An error message is displayed for an invalid request');

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
});

test('print reports invalid', function (assert) {
  assert.expect(1);
  visit('/print/reports/6');

  andThen(function () {
    assert.equal(currentURL(),
      '/print/reports/6/invalid',
      'Redirect to invalid sub route');
  });
});

test('print url provided report', function(assert) {
  assert.expect(2);

  visit(`/print/reports/new?model=${SERIALIZED_MODEL}`);

  andThen(function() {
    assert.equal(find('.navi-report__title').text().trim(),
      'Hyrule News',
      'The report title passed through the model query param is visible');

    assert.ok(find('.line-chart-widget').is(':visible'),
      'The visualization type passed through the model query param is visible');
  });
});
