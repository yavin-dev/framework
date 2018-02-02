import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import wait from 'ember-test-helpers/wait';

const TEMPLATE = hbs`
    {{#report-actions/multiple-format-export
        report=report
        disabled=disabled
        naviNotifications=mockNotifications
    }}
        Export
    {{/report-actions/multiple-format-export}}
    `;

const { getOwner } = Ember;

let Store;

moduleForComponent('report-actions/multiple-format-export', 'Integration | Component | report actions - multiple-format-export', {
  integration: true,

  beforeEach() {
    setupMock();
    Store = getOwner(this).lookup('service:store');

    // Mock notifications
    this.mockNotifications = {
      add: () => null
    };

    return getOwner(this).lookup('service:bard-metadata').loadMetadata().then(() => {
      return Store.findRecord('report', 1);
    }).then(report => { this.set('report', report); });
  },
  afterEach() {
    teardownMock();
  }
});

test('export links', function(assert) {
  assert.expect(3);

  let factService = getOwner(this).lookup('service:bard-facts');

  this.render(TEMPLATE);

  assert.equal(this.$('.ember-basic-dropdown-trigger').text().trim(),
    'Export',
    'Component yields content as expected');

  clickTrigger();
  return wait().then(() => {
    // CSV
    let expectedHref = factService.getURL(this.report.get('request').serialize(), { format: 'csv' });
    assert.equal(this.$('.multiple-format-export__dropdown a:contains("CSV")').attr('href'),
      expectedHref,
      'CSV link has appropriate link to API');

    // PDF
    expectedHref = '/export?reportModel=EQbwOsAmCGAu0QFzmAS0kiBGCAaCcsATqgEYCusApgM5IoBuqN50ANqgF5yoD2AdvQiwAngAcqmYB35UAtAGMAFtCKw8EBlSI0-g4Iiz5gAWyrwY8IcGgAPZtZHWa21LWuiJUyKjP9dAhrACgIAZqgA5tZmxKgKUtCQAMIcCgDWdMDGPn4B_ADyRJDaSADaEGJEvBJqTsAAutm-VP56mYilKPzQZlIAClU1ogAEOFma7OTuBiiV1dqiUlhYACwQAL7ruF09kgYQA_O1wwBMQQyT08gVgwt1iNgADM-PY5vbEN29-8CHQyLDADM50u7Vmt1qSxejzOwE29U2iK2wlQsDYewewAAEiIiOR0cMAHJUADumWMRCoAEcpjR1DMIGxeBE4uwACrQUjojyc7k_WSwEm8IhpIKwZoAcSI0FQ-kxMDqyNM5hICnanQgMVVCWSqQyGw-yti8X50AYKTi-rhjQgORaeXVKDtrUCPzm_w2NuA4TY1B0ZS9KiY_CiBlKXpowvpHRQWriUm65r15NtqEpCnFrsx0BoJvWXtlfoubEdEDpqmjEBOrwArHJlnJHgBOYbPRBt54AOheQRaGB-1awdYbWAAbK3Hu3J12e9bjKRVJAAGraPJSBhjCnU2mwFc6PTrt5KylsHgCGhKVBiMEEShKYXWSwIBnATwYiDkFz-8ZofuYxOoAA-p-JRwu8wjiO-wCUmIUaZJswBAAA';
    assert.equal(this.$('.multiple-format-export__dropdown a:contains("PDF")').attr('href'),
      expectedHref,
      'PDF link has appropriate link to export service');
  });
});

test('close on click', function(assert) {
  assert.expect(3);

  this.render(TEMPLATE);

  // Default state
  assert.notOk(this.$('.ember-basic-dropdown-trigger').attr('aria-expanded'),
    'The dropdown is closed by default');

  // Click trigger
  clickTrigger();
  assert.ok(this.$('.ember-basic-dropdown-trigger').attr('aria-expanded'),
    'The dropdown is open when the trigger is clicked');

  // Click export option
  this.$('.multiple-format-export__dropdown a:contains("CSV")').click();
  return wait().then(() => {
    assert.notOk(this.$('.ember-basic-dropdown-trigger').attr('aria-expanded'),
      'The dropdown is closed when an export option is clicked')
  });
});

test('disabled dropdown', function(assert) {
  assert.expect(1);

  this.set('disabled', true);
  this.render(TEMPLATE);
  clickTrigger();

  return wait().then(() => {
    assert.notOk($('.ember-basic-dropdown-content-placeholder').is(':visible'),
      'Dropdown should not be visible');
  });
})

test('notifications', function(assert) {
  assert.expect(1);

  this.mockNotifications.add = ({ message }) => {
    assert.equal(message,
      'CSV? Got it. The download should begin soon.',
      'A notification is added for the clicked export type')
  };

  this.render(TEMPLATE);

  clickTrigger();
  this.$('.multiple-format-export__dropdown a:contains("CSV")').click();
});