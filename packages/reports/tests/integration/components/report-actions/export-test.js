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
    Export
  </ReportActions::Export>`;

let Store;

module('Integration | Component | report actions - export', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');
  });

  test('Component Renders', async function(assert) {
    assert.expect(4);

    const factService = this.owner.lookup('service:navi-facts');
    this.owner.lookup('service:navi-metadata').loadMetadata();
    const report = await Store.findRecord('report', 1);

    this.set('report', report);
    await render(TEMPLATE);

    const component = $('a.report-control').get(0);

    assert.equal(component.text.trim(), 'Export', 'Component yields content as expected');

    assert.equal(component.getAttribute('target'), '_blank', 'Component has target attribute as _blank');

    assert.equal(component.getAttribute('download'), 'true', 'Component has download attribute as true');

    const expectedHref = factService.getURL(report.get('request').serialize(), {
      format: 'csv'
    });
    assert.equal(component.getAttribute('href'), expectedHref, 'Component has appropriate link to API');
  });

  test('Component is not disabled for unsaved reports', async function(assert) {
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
          values: ['current', 'next']
        }
      ],
      columns: [],
      sorts: []
    };
    this.set('report', Store.createRecord('report', { title: 'New Report', request }));

    await render(TEMPLATE);

    assert.notOk(!!$('a.report-control.disabled').length, 'Component is not disabled for unsaved reports');
  });
});
