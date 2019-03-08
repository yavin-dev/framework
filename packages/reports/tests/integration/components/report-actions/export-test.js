import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { moduleForComponent, test } from 'ember-qunit';
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

moduleForComponent('export-report', 'Integration | Component | report actions - export', {
  integration: true,

  beforeEach() {
    setupMock();
    Store = getOwner(this).lookup('service:store');
  },
  afterEach() {
    teardownMock();
  }
});

test('Component Renders', function(assert) {
  assert.expect(4);

  let factService = getOwner(this).lookup('service:bard-facts'),
    reportPromise = getOwner(this)
      .lookup('service:bard-metadata')
      .loadMetadata()
      .then(() => {
        return Store.findRecord('report', 1);
      });

  reportPromise.then(report => {
    this.set('report', report);
  });

  return reportPromise.then(report => {
    this.render(TEMPLATE);

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

test('Component is not disabled for unsaved reports', function(assert) {
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

  this.render(TEMPLATE);

  assert.notOk(!!$('a.report-control.disabled').length, 'Component is not disabled for unsaved reports');
});
