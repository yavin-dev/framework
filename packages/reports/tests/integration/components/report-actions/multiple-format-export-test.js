import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent, click, find } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import $ from 'jquery';
import hbs from 'htmlbars-inline-precompile';
import config from 'ember-get-config';
import Service from '@ember/service';
import moment from 'moment';

const TEMPLATE = hbs`
    <ReportActions::MultipleFormatExport
      @model={{this.report}}
      @disabled={{this.disabled}}
    >
      Export
    </ReportActions::MultipleFormatExport>
    `;

let Store;

module('Integration | Component | report actions - multiple-format-export', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    Store = this.owner.lookup('service:store');
    const report = await Store.findRecord('report', 1);
    this.set('report', report);
    this.set('disabled', false);
  });

  test('it renders', async function (assert) {
    assert.expect(1);
    await render(TEMPLATE);
    assert.dom('.menu-trigger').hasText('Export', 'Component yields content as expected');
  });

  test('export CSV download link', async function (assert) {
    assert.expect(1);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv', 'pdf', 'png'];

    await render(TEMPLATE);

    const factService = this.owner.lookup('service:navi-facts');
    const expectedHref = factService.getURL(this.report.request.serialize(), { format: 'csv' });

    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("CSV")')[0]);
    assert
      .dom('.export__download-link')
      .hasAttribute('href', expectedHref, 'The href attribute is set correctly for CSV');

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('export PDF download link', async function (assert) {
    assert.expect(1);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv', 'pdf', 'png'];

    await render(TEMPLATE);

    // PDF
    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("PDF")')[0]);
    const actualPDFhref = find('.export__download-link').getAttribute('href');
    const encodedModel = actualPDFhref.split('/export?reportModel=')[1];
    const compressionService = this.owner.lookup('service:compression');
    const actualModel = (await compressionService.decompressModel(encodedModel)).serialize();
    const expectedModel = this.report.serialize();

    //strip off owner
    delete expectedModel.data.relationships;

    assert.deepEqual(actualModel, expectedModel, 'PDF link is correct');

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('export PNG download link', async function (assert) {
    assert.expect(2);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv', 'pdf', 'png'];

    await render(TEMPLATE);

    // PNG
    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("PNG")')[0]);
    const actualPNGhref = find('.export__download-link').getAttribute('href');
    assert.ok(actualPNGhref.endsWith('&fileType=png'), 'url has correct fileType query param');

    const encodedModel = actualPNGhref.replace('&fileType=png', '').split('/export?reportModel=')[1];
    const compressionService = this.owner.lookup('service:compression');
    const actualModel = (await compressionService.decompressModel(encodedModel)).serialize();
    const expectedModel = this.report.serialize();

    //strip off owner
    delete expectedModel.data.relationships;

    assert.deepEqual(actualModel, expectedModel, 'PNG link is correct');

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('filename', async function (assert) {
    assert.expect(1);
    const dateString = moment().format('YYYYMMDD-tHHmmss');
    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv'];

    await render(TEMPLATE);
    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("CSV")')[0]);
    assert.equal(
      find('.export__download-link').getAttribute('download'),
      `hyrule-news-${dateString}.csv`,
      'The download attribute is set correctly'
    );

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('disabled dropdown', async function (assert) {
    assert.expect(1);

    this.set('disabled', true);
    await render(TEMPLATE);

    await triggerEvent('.menu-trigger', 'mouseenter');
    assert.dom('.menu-content').doesNotExist('Dropdown content should not exist');
  });

  test('unsaved report', async function (assert) {
    assert.expect(2);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv', 'gsheet'];

    const request = {
      table: 'network',
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0',
      filters: [
        {
          type: 'timeDimension',
          source: 'bardOne',
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['current', 'next'],
        },
      ],
      columns: [],
      sorts: [],
    };
    this.set('report', Store.createRecord('report', { title: 'New Report', request }));
    await render(TEMPLATE);

    await triggerEvent('.menu-trigger', 'mouseenter');
    assert
      .dom($('.menu-content span:contains("Google Sheet")')[0])
      .hasClass('is-disabled', 'option that requires save is disabled');
    assert
      .dom($('.menu-content a:contains("CSV")')[0])
      .doesNotHaveClass('is-disabled', 'option that does not require save is not disabled');

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('notifications - valid report', async function (assert) {
    assert.expect(2);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['pdf'];
    class MockNotifications extends Service {
      add({ title }) {
        assert.step(title);
      }
      clear() {}
    }
    this.owner.register('service:navi-notifications', MockNotifications);

    await render(TEMPLATE);
    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("PDF")')[0]);

    assert.verifySteps(
      ['Your PDF download should begin shortly'],
      'A single notification is added for the clicked export type'
    );

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('notifications - invalid report', async function (assert) {
    assert.expect(3);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['png'];

    const report = await Store.findRecord('report', 2);
    this.set('report', report);
    class MockNotifications extends Service {
      add({ title }) {
        assert.step(title);
      }
      clear() {}
    }
    this.owner.register('service:navi-notifications', MockNotifications);

    await render(TEMPLATE);
    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("PNG")')[0]);

    assert.verifySteps(
      ['Your PNG download should begin shortly', 'Please validate the report and try again.'],
      'An error notification is added for an invalid report'
    );

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('GSheet Notification', async function (assert) {
    assert.expect(3);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['gsheet'];

    let addCalls = 0;
    class MockNotifications extends Service {
      add({ title, context }) {
        addCalls++;
        if (addCalls === 1) {
          assert.equal(
            title,
            'We are building your spreadsheet and sending it to Google Drive. Keep an eye out for the email!',
            'A notification is added for the clicked export type'
          );
        } else {
          assert.equal(title, 'Your export has finished!', 'Second notification after ajax call comes back');
          assert.equal(
            context,
            'Click <a href="https://google.com/sheets/foo" target="_blank" rel="noopener noreferrer">here to view it &raquo;</a>',
            'correct URL was returned'
          );
        }
      }
      clear() {}
    }
    this.owner.register('service:navi-notifications', MockNotifications);

    await render(TEMPLATE);
    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("Google Sheet")')[0]);

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('notifications - error', async function (assert) {
    assert.expect(3);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['png'];
    class MockNotifications extends Service {
      add({ title }) {
        assert.step(title);
      }
      clear() {}
    }
    class MockCompression extends Service {
      // eslint-disable-next-line require-yield
      compressModel() {
        throw new Error(`Whoa! Compression failed`);
      }
    }

    this.owner.register('service:navi-notifications', MockNotifications);
    this.owner.register('service:compression', MockCompression);

    await render(TEMPLATE);
    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("PNG")')[0]);

    assert.verifySteps(
      ['Your PNG download should begin shortly', `Whoa! Compression failed`],
      'An error notification is added when an error is thrown'
    );

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });
});
