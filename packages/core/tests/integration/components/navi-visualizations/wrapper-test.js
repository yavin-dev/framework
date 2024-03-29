import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import NaviFactResponse from '@yavin/client/models/navi-fact-response';
import { setupMirage } from 'ember-cli-mirage/test-support';

const Request = {
  table: 'network',
  dataSource: 'bardOne',
  limit: null,
  requestVersion: '2.0',
  filters: [
    {
      type: 'timeDimension',
      field: 'network.dateTime',
      parameters: { grain: 'day' },
      operator: 'bet',
      values: ['2015-10-02', '2015-10-14'],
      source: 'bardOne',
    },
  ],
  columns: [
    {
      cid: 'c1',
      type: 'timeDimension',
      field: 'network.dateTime',
      parameters: {
        grain: 'day',
      },
      source: 'bardOne',
    },
    {
      cid: 'c2',
      type: 'metric',
      field: 'adClicks',
      parameters: {},
      source: 'bardOne',
    },
  ],
  sorts: [],
};

const TEMPLATE = hbs`
<NaviVisualizations::Wrapper
  @request={{this.report.request}}
  @response={{this.response}}
  @settings={{this.report.visualization.metadata}}
  @manifest={{this.report.visualization.manifest}}
  @isPrint={{this.isPrint}}
/>`;

let Store;
module('Integration | Component | navi-visualizations/wrapper', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    Store = this.owner.lookup('service:store');
    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardOne' });
    this.set(
      'report',
      Store.createRecord('report', {
        request: Request,
        visualization: {
          vizModelType: 'table',
          type: 'table',
          version: 2,
          metadata: {
            columnAttributes: {
              c1: { canAggregateSubtotal: false },
              c3: { canAggregateSubtotal: false },
              c2: { canAggregateSubtotal: false },
            },
            showTotals: {},
          },
        },
      })
    );
  });

  test('it renders the specified visualization', async function (assert) {
    assert.expect(2);

    this.set('isPrint', false);
    await render(TEMPLATE);

    assert.ok(!!findAll('.table-widget').length, 'navi-visualization wrapper renders the correct visualization');

    assert.notOk(
      !!findAll('.table-widget--print').length,
      'navi-visualization wrapper renders the correct screen visualization'
    );
  });

  test('it renders the specified print visualization', async function (assert) {
    assert.expect(1);

    this.set('isPrint', true);
    await render(TEMPLATE);

    assert.ok(
      !!findAll('.table-widget--print').length,
      'navi-visualization wrapper renders the correct print visualization'
    );
  });

  test('it renders the specified fallback print visualization', async function (assert) {
    assert.expect(2);

    this.set(
      'report',
      Store.createRecord('report', {
        request: Request,
        visualization: {
          vizModelType: 'metric-label',
          type: 'metric-label',
          version: 2,
          metadata: {
            format: '0,0.00',
            metricCid: 'c1',
          },
        },
      })
    );
    this.set('response', new NaviFactResponse(this.owner.lookup('service:client-injector'), { rows: [] }));

    this.set('isPrint', true);
    await render(TEMPLATE);

    assert
      .dom('.metric-label-vis')
      .exists('navi-visualization wrapper falls back to non print visualization when print version is not available');

    assert
      .dom('.metric-label-vis--print')
      .doesNotExist(
        'navi-visualization wrapper falls back to non print visualization when print version is not available'
      );
  });
});
