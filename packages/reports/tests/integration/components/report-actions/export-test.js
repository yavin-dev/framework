import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-core/utils/classes/interval';
import moment from 'moment';

const TEMPLATE = hbs`
    {{#report-actions/export
        report=report
    }}
        Export
    {{/report-actions/export}}
    `;

let Store;

module('Integration | Component | report actions - export', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    Store = this.owner.lookup('service:store');
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('Component Renders', function(assert) {
    assert.expect(4);

    let factService = this.owner.lookup('service:bard-facts'),
      reportPromise = this.owner
        .lookup('service:bard-metadata')
        .loadMetadata()
        .then(() => {
          return Store.findRecord('report', 1);
        });

    reportPromise.then(report => {
      this.set('report', report);
    });

    return reportPromise.then(async report => {
      await render(TEMPLATE);

      let component = $('a.report-control').get(0);

      assert.equal(component.text.trim(), 'Export', 'Component yields content as expected');

      assert.equal(component.getAttribute('target'), '_blank', 'Component has target attribute as _blank');

      assert.equal(component.getAttribute('download'), 'true', 'Component has download attribute as true');

      let expectedHref = factService.getURL(report.get('request').serialize(), {
        format: 'csv'
      });
      assert.equal(component.getAttribute('href'), expectedHref, 'Component has appropriate link to API');
    });
  });

  test('Component is not disabled for unsaved reports', async function(assert) {
    assert.expect(1);

    run(() => {
      let request = {
        logicalTable: {
          table: 'network',
          timeGrain: 'day'
        },
        intervals: [
          Store.createFragment('bard-request/fragments/interval', {
            interval: new Interval(moment('10-02-2015', 'MM-DD-YYYY'), moment('10-14-2015', 'MM-DD-YYYY'))
          })
        ]
      };
      this.set('report', Store.createRecord('report', { title: 'New Report', request }));
    });

    await render(TEMPLATE);

    assert.notOk(!!$('a.report-control.disabled').length, 'Component is not disabled for unsaved reports');
  });
});
