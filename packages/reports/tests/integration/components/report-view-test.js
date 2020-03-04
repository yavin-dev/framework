import { A } from '@ember/array';
import { helper as buildHelper } from '@ember/component/helper';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import $ from 'jquery';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-core/utils/classes/interval';
import config from 'ember-get-config';
import { animationsSettled } from 'ember-animated/test-support';

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

module('Integration | Component | report view', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    this.owner.register(
      'helper:route-action',
      buildHelper(() => {
        return () => {};
      }),
      {
        instantiate: false
      }
    );

    const metadataService = this.owner.lookup('service:bard-metadata');
    const store = this.owner.lookup('service:store');

    await metadataService.loadMetadata();
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

  test('metric label visualization selector is available on single metric, single time bucket, no dimensions', async function(assert) {
    assert.expect(2);

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

    await render(hbs`
      <ReportView
        @report={{this.report}}
        @response={{this.response}}
      />
    `);

    assert.ok($('.visualization-toggle__option:contains(Data Table)').is(':visible'), 'Table Selector is visible');

    assert.ok(
      $('.visualization-toggle__option:contains(Metric Label)').is(':visible'),
      'Metric Label Selector is visible'
    );
  });

  test('visualization is chosen based on report', async function(assert) {
    assert.expect(3);

    await render(hbs`
      <ReportView
        @report={{this.report}}
        @response={{this.response}}
      />
    `);

    assert.ok(
      $('.line-chart-widget').is(':visible'),
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

    assert.ok($('.table-widget').is(':visible'), 'Rendered visualization updates with report');

    assert.notOk($('.line-chart-widget').is(':visible'), 'Old visualization is removed');
  });

  test('no data', async function(assert) {
    assert.expect(1);
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

    await render(hbs`
      <ReportView
        @report={{this.report}}
        @response={{this.response}}
      />
    `);

    assert
      .dom('.report-view__visualization-no-results')
      .hasText('No results available.', 'A message is displayed when the response has no data');
  });

  test('toggle columns drawer', async function(assert) {
    const originalFeatureFlag = config.navi.FEATURES.enableRequestPreview;
    config.navi.FEATURES.enableRequestPreview = true;

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

    await render(hbs`
      <ReportView
        @report={{this.report}}
        @response={{this.response}}
      />
    `);

    assert.dom('.navi-column-config__panel').exists('Column config drawer is open by default');
    assert
      .dom('.report-view__columns-icon.fa-chevron-left')
      .exists('Column config drawer displays "back" icon when open');

    await click('.report-view__columns-button');
    await animationsSettled();
    assert
      .dom('.navi-column-config__panel')
      .doesNotExist('Column config drawer is closed after toggling the columns button');
    assert
      .dom('.report-view__columns-icon.fa-columns')
      .exists('Column config drawer displays "column" icon when closed');

    await click('.report-view__columns-button');
    await animationsSettled();
    assert.dom('.navi-column-config__panel').exists('Column config drawer is open after toggling the columns button');
    assert
      .dom('.report-view__columns-icon.fa-chevron-left')
      .exists('Column config drawer displays "back" icon when open');
    config.navi.FEATURES.enableRequestPreview = originalFeatureFlag;
  });
});
