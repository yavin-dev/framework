import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

const TEMPLATE = hbs`
  <ReportActions::Export
    @model={{this.report}}
    as |onClick|
  >
    <DenaliButton
      @style="text"
      @size="medium"
      @icon="download"
      class="report-actions__export-btn"
      {{on "click" onClick}}
    >
      Export
    </DenaliButton>
  </ReportActions::Export>`;

let Store;

module('Integration | Component | report actions - export', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    Store = this.owner.lookup('service:store');
    const report = await Store.findRecord('report', 1);
    this.set('report', report);
  });

  test('Component Renders', async function (assert) {
    await render(TEMPLATE);
    assert.dom('.report-actions__export-btn').hasText('Export', 'Component yields given text');
  });

  test('export url', async function (assert) {
    assert.expect(1);

    await render(TEMPLATE);
    await click('.report-actions__export-btn');

    assert
      .dom('.export__download-link')
      .hasAttribute(
        'href',
        /(?=.*?data.naviapp.io)(?=.*format=csv)(?=.*dateTime=)(?=.*csv&filename=Hyrule%20News-\d\d\d\d\d\d\d*T\d\d\d\d\d\d)/,
        'csv export url is generated for the report'
      );
  });

  test('filename', async function (assert) {
    assert.expect(1);

    await render(TEMPLATE);
    await click('.report-actions__export-btn');

    assert
      .dom('.export__download-link')
      .hasAttribute(
        'download',
        /(?=.*hyrule-news-\d\d\d\d\d\d\d*-t\d\d\d\d\d\d)/,
        'csv export url is generated for the report'
      );
  });

  test('notifications - valid report', async function (assert) {
    assert.expect(2);
    class MockNotifications extends Service {
      add({ title }) {
        assert.step(title);
      }
      clear() {}
    }
    this.owner.register('service:navi-notifications', MockNotifications);

    await render(TEMPLATE);
    await click('.report-actions__export-btn');

    assert.verifySteps(['Your CSV download should begin shortly'], 'A single notification is added for a valid report');
  });

  test('notifications - invalid report', async function (assert) {
    assert.expect(3);
    class MockNotifications extends Service {
      add({ title }) {
        assert.step(title);
      }
      clear() {}
    }
    this.owner.register('service:navi-notifications', MockNotifications);

    const report = await Store.findRecord('report', 2);
    this.set('report', report);

    await render(TEMPLATE);
    await click('.report-actions__export-btn');

    assert.verifySteps(
      ['Your CSV download should begin shortly', 'Please validate the report and try again.'],
      'An error notification is added for an invalid report'
    );
  });

  test('notifications - error', async function (assert) {
    assert.expect(3);
    class MockNotifications extends Service {
      add({ title }) {
        assert.step(title);
      }
      clear() {}
    }
    class MockFacts extends Service {
      // eslint-disable-next-line require-yield
      getDownloadURL() {
        throw new Error(`Whoa! Couldn't get the url`);
      }
    }

    this.owner.register('service:navi-notifications', MockNotifications);
    this.owner.register('service:navi-facts', MockFacts);

    await render(TEMPLATE);
    await click('.report-actions__export-btn');

    assert.verifySteps(
      ['Your CSV download should begin shortly', `Whoa! Couldn't get the url`],
      'An error notification is added when an error is thrown'
    );
  });
});
