import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { moduleForComponent, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Interval from 'navi-core/utils/classes/interval';

const RESPONSE = {
  rows: [
    {
      adClicks: 1707077,
      dateTime: '2015-11-09 00:00:00.000'
    },
    {
      adClicks: 1659538,
      dateTime: '2015-11-09 00:00:00.000'
    },
    {
      adClicks: 1977070,
      dateTime: '2015-11-11 00:00:00.000'
    },
    {
      adClicks: 1755382,
      dateTime: '2015-11-12 00:00:00.000'
    },
    {
      adClicks: 1348750,
      dateTime: '2015-11-13 00:00:00.000'
    },
    {
      adClicks: 856732,
      dateTime: '2015-11-14 00:00:00.000'
    },
    {
      adClicks: 716731,
      dateTime: '2015-11-14 00:00:00.000'
    },
    {
      adClicks: 399790,
      dateTime: '2015-11-14 00:00:00.000'
    },
    {
      adClicks: 699490,
      dateTime: '2015-11-14 00:00:00.000'
    }
  ]
};

moduleForComponent('print-report-view', 'Integration | Component | print report view', {
  integration: true,

  beforeEach() {
    setupMock();

    let metadataService = getOwner(this).lookup('service:bard-metadata'),
      store = getOwner(this).lookup('service:store');

    metadataService.loadMetadata().then(() => {
      this.set('response', RESPONSE);

      //set report object
      this.set(
        'report',
        store.createRecord('report', {
          request: store.createFragment('bard-request/request', {
            logicalTable: store.createFragment('bard-request/fragments/logicalTable', {
              table: metadataService.getById('table', 'spaceId'),
              timeGrainName: 'day'
            }),
            responseFormat: 'csv',
            intervals: A([{ interval: new Interval('current', 'next') }])
          }),
          visualization: {
            type: 'line-chart',
            version: 1,
            metadata: {
              axis: {
                y: {
                  series: {
                    type: 'metric',
                    config: {
                      metrics: [
                        {
                          metric: 'adClicks',
                          parameters: {},
                          canonicalName: 'adClicks',
                          longName: 'Ad Clicks'
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        })
      );
    });
  },

  afterEach() {
    teardownMock();
  }
});

test('visualization is chosen based on report', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    this.render(hbs`
            {{print-report-view
                report=report
                response=response
            }}
        `);

    assert.ok(
      this.$('.line-chart-widget').is(':visible'),
      'Visualization is rendered based on the report visualization type'
    );

    this.set('report.visualization', {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          {
            attributes: { name: 'dateTime' },
            type: 'dateTime',
            displayName: 'Date'
          },
          {
            attributes: { name: 'adClicks' },
            type: 'metric',
            displayName: 'Ad Clicks'
          }
        ]
      }
    });

    assert.ok(this.$('.table-widget').is(':visible'), 'Rendered visualization updates with report');

    assert.notOk(this.$('.line-chart-widget').is(':visible'), 'Old visualization is removed');
  });
});

test('no data', function(assert) {
  assert.expect(1);

  return wait().then(() => {
    this.set('response', {
      rows: [],
      meta: {
        pagination: {
          currentPage: 1,
          rowsPerPage: 10000,
          numberOfResults: 0
        }
      }
    });

    this.render(hbs`
            {{print-report-view
                report=report
                response=response
            }}
        `);

    assert.equal(
      this.$('.print-report-view__visualization-no-results')
        .text()
        .trim(),
      'No results available.',
      'A message is displayed when the response has no data'
    );
  });
});
