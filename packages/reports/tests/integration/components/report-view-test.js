import { A } from '@ember/array';
import { helper as buildHelper } from '@ember/component/helper';
import { getOwner } from '@ember/application';
import { moduleForComponent, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
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

moduleForComponent('report-view', 'Integration | Component | report view', {
  integration: true,

  beforeEach() {
    setupMock();

    this.register(
      'helper:route-action',
      buildHelper(() => {
        return () => {};
      }),
      {
        instantiate: false
      }
    );

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
              table: metadataService.getById('table', 'tableA'),
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
                          canonicalName: 'adClicks'
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

test('metric label visualization selector is available on single metric, single time bucket, no dimensions', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    this.set('report.request', {
      logicalTable: {
        table: 'network',
        timeGrain: { name: 'day' }
      },
      metrics: [{ metric: 'adClicks' }],
      dimensions: [],
      filters: [],
      sort: [
        {
          metric: 'navClicks',
          direction: 'asc'
        }
      ],
      intervals: A([{ interval: new Interval('current', 'next') }]),
      bardVersion: 'v1',
      requestVersion: 'v1'
    });

    this.render(hbs`
            {{report-view
                report=report
                response=response
            }}
        `);

    assert.ok(this.$('.visualization-toggle__option:contains(Data Table)').is(':visible'), 'Table Selector is visible');

    assert.ok(
      this.$('.visualization-toggle__option:contains(Metric Label)').is(':visible'),
      'Metric Label Selector is visible'
    );
  });
});

test('visualization is chosen based on report', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    this.render(hbs`
            {{report-view
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

    return wait().then(() => {
      this.render(hbs`
            {{report-view
                report=report
                response=response
            }}
        `);

      assert.equal(
        this.$('.report-view__visualization-no-results')
          .text()
          .trim(),
        'No results available.',
        'A message is displayed when the response has no data'
      );
    });
  });
});
