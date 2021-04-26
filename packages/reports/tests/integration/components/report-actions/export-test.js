import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';

const TEMPLATE = hbs`
  <ReportActions::Export
    @report={{this.report}}
  >
  <DenaliButton
    @style="text"
    @size="medium"
    @icon="download"
    class="report-actions__export-btn"
    {{on "click" (perform this.getDownloadURLTask)}}
  >
    Export
  </DenaliButton>
  </ReportActions::Export>`;

let Store;

module('Integration | Component | report actions - export', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    Store = this.owner.lookup('service:store');
  });

  test('Component Renders', async function (assert) {
    this.owner.lookup('service:navi-metadata').loadMetadata();
    const report = await Store.findRecord('report', 1);

    this.set('report', report);
    await render(TEMPLATE);
    assert.dom('.report-actions__export-btn').hasText('Export', 'Component yields given text');
  });

  test('Component is not disabled for unsaved reports', async function (assert) {
    assert.expect(1);

    let request = {
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
    assert.dom('.report-actions__export-btn').isNotDisabled('Component is not disabled for unsaved reports');
  });
});
