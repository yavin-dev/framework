import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find } from '@ember/test-helpers';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';

const TEMPLATE = hbs`
    {{#report-actions/multiple-format-export
        report=report
        disabled=disabled
        naviNotifications=mockNotifications
    }}
        Export
    {{/report-actions/multiple-format-export}}
    `;

let Store;

module('Integration | Component | report actions - multiple-format-export', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    Store = this.owner.lookup('service:store');

    // Mock notifications
    this.mockNotifications = {
      add: () => null
    };

    return this.owner
      .lookup('service:bard-metadata')
      .loadMetadata()
      .then(() => {
        return Store.findRecord('report', 1);
      })
      .then(report => {
        this.set('report', report);
      });
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('export links', async function(assert) {
    assert.expect(3);

    let factService = this.owner.lookup('service:bard-facts');

    await render(TEMPLATE);

    assert.dom('.ember-basic-dropdown-trigger').hasText('Export', 'Component yields content as expected');

    clickTrigger();
    return settled().then(() => {
      // CSV
      let expectedHref = factService.getURL(this.report.get('request').serialize(), { format: 'csv' });
      assert.equal(
        this.$('.multiple-format-export__dropdown a:contains("CSV")').attr('href'),
        expectedHref,
        'CSV link has appropriate link to API'
      );

      // PDF
      expectedHref =
        '/export?reportModel=EQbwOsAmCGAu0QFzmAS0kiBGCAaCcsATqgEYCusApgM5IoBuqN50ANqgF5yoD2AdvQiwAngAcqmYB35UAtAGMAFtCKw8EBlSI0-g4Iiz5gAWyrwY8IcGgAPZtZHWa21LWuiJUyKjP9dAhrACgIAZqgA5tZmxKgK0eYk8QYEkADCHAoA1nTAxmKq0DHaucgAvmXGPn4B_ADyRJDaSADaEGJEvBJqTsAAulW-VP56pS0o_EWSKcAACp3dogAEOHma7OTuBigdXdqiUlhYACwQFbgTU1Lzez1LAExBDBtbyO0L-72I2AAMfz-rc6XMzXD53ADMTxepR2YIOMyw_x-j2AFT6FQxlWEqFgbGm32AAAkRERyHilgA5KgAd1yxiIVAAjpsaOpthA2LwInF2AAVaCkPEeAVCmayWDU3hELJBWBDADiRGgqH0BJgvSxpkScTGKBiSSk0HSmRyZwuEH1cSkkwYGTiptRAwg1WGtV1zqGI0CM12iw1TuA4TY1B0rQDKiY_CiBhaAZoUrZiHGFu1yQJNrt2TpHoZCjl3oJ0BoyTKAZVIeebHdwFZqkTEHuAIArHIjnIfgBOJZ_RA9v4AOn-QWGGBmjawLbbWAAbN2fr35wOh47jKRVJAAGolPRSBirelMlmwLc6HczPdnTUMtg8AQ0JSoMQwgiUJRS6yWBDs4CefEQcguKGaxoKO6bQEwAD6AHNKi5zCOIf7AAyYgJrkFTAEAA';
      assert.equal(
        this.$('.multiple-format-export__dropdown a:contains("PDF")').attr('href'),
        expectedHref,
        'PDF link has appropriate link to export service'
      );
    });
  });

  test('filename', async function(assert) {
    assert.expect(1);

    await render(TEMPLATE);

    clickTrigger();
    return settled().then(() => {
      assert.equal(
        this.$('.multiple-format-export__dropdown a:contains("CSV")').attr('download'),
        'hyrule-news',
        'The download attribute is set to the dasherized report name'
      );
    });
  });

  test('close on click', async function(assert) {
    assert.expect(3);

    await render(TEMPLATE);

    // Default state
    assert.notOk(
      find('.ember-basic-dropdown-trigger').getAttribute('aria-expanded'),
      'The dropdown is closed by default'
    );

    // Click trigger
    clickTrigger();
    assert.ok(
      find('.ember-basic-dropdown-trigger').getAttribute('aria-expanded'),
      'The dropdown is open when the trigger is clicked'
    );

    // Click export option
    this.$('.multiple-format-export__dropdown a:contains("CSV")').click();
    return settled().then(() => {
      assert.notOk(
        find('.ember-basic-dropdown-trigger').getAttribute('aria-expanded'),
        'The dropdown is closed when an export option is clicked'
      );
    });
  });

  test('disabled dropdown', async function(assert) {
    assert.expect(1);

    this.set('disabled', true);
    await render(TEMPLATE);
    clickTrigger();

    return settled().then(() => {
      assert.notOk($('.ember-basic-dropdown-content-placeholder').is(':visible'), 'Dropdown should not be visible');
    });
  });

  test('notifications', async function(assert) {
    assert.expect(1);

    this.mockNotifications.add = ({ message }) => {
      assert.equal(
        message,
        'CSV? Got it. The download should begin soon.',
        'A notification is added for the clicked export type'
      );
    };

    await render(TEMPLATE);

    clickTrigger();
    this.$('.multiple-format-export__dropdown a:contains("CSV")').click();
  });
});
