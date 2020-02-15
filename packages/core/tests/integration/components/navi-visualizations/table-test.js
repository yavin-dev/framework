import config from 'ember-get-config';
import { set } from '@ember/object';
import { A as arr } from '@ember/array';
import { merge } from 'lodash-es';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const TEMPLATE = hbs`
  <div style="width: 800px; height: 800px; display: flex;">
    {{navi-visualizations/table
      model=model
      options=options
      bufferSize=20
      onUpdateReport=(action onUpdateReport)
    }}
  </div>`;

const ROWS = [
  {
    dateTime: '2016-05-30 00:00:00.000',
    'os|id': 'All Other',
    'os|desc': 'All Other',
    uniqueIdentifier: 172933788,
    totalPageViews: 3669828357
  },
  {
    dateTime: '2016-06-10 00:00:00.000',
    'os|id': 'All Other',
    'os|desc': 'All Other',
    uniqueIdentifier: 172933788,
    totalPageViews: 3669828357
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'os|id': 'Android',
    'os|desc': 'Android',
    uniqueIdentifier: 183206656,
    totalPageViews: 4088487125
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'os|id': 'BlackBerry',
    'os|desc': 'BlackBerry OS',
    uniqueIdentifier: 183380921,
    totalPageViews: 4024700302
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'os|id': 'ChromeOS',
    'os|desc': 'Chrome OS',
    uniqueIdentifier: 180559793,
    totalPageViews: 3950276031
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'os|id': 'Firefox',
    'os|desc': 'Firefox OS',
    uniqueIdentifier: 172724594,
    totalPageViews: 3697156058
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'os|id': 'Mac',
    'os|desc': 'Apple Mac OS X',
    uniqueIdentifier: 152298735,
    totalPageViews: 3008425744
  },
  {
    dateTime: '2016-05-30 00:00:00.000',
    'os|id': 'Unknown',
    'os|desc': 'Unknown',
    uniqueIdentifier: 155191081,
    totalPageViews: 3072620639
  }
];

const Model = arr([
  {
    request: {
      dimensions: [{ dimension: 'os' }],
      metrics: [
        { metric: 'uniqueIdentifier', parameters: {} },
        { metric: 'totalPageViews', parameters: {} },
        { metric: 'platformRevenue', parameters: { currency: 'USD', as: 'm1' } }
      ],
      sort: [{ metric: 'm1', direction: 'desc' }, { metric: 'uniqueIdentifier', direction: 'asc' }],
      logicalTable: {
        table: 'network',
        timeGrain: {
          name: 'day'
        }
      }
    },
    response: {
      rows: ROWS
    }
  }
]);

const Options = {
  columns: [
    {
      attributes: { name: 'dateTime' },
      type: 'dateTime',
      displayName: 'Date'
    },
    {
      attributes: { name: 'os' },
      type: 'dimension',
      displayName: 'Operating System'
    },
    {
      attributes: { name: 'uniqueIdentifier', parameters: {} },
      type: 'metric',
      displayName: 'Unique Identifiers'
    },
    {
      attributes: { name: 'totalPageViews', parameters: {} },
      type: 'metric',
      displayName: 'Total Page Views'
    },
    {
      attributes: { name: 'platformRevenue', parameters: { currency: 'USD' } },
      type: 'metric',
      displayName: 'Platform Revenue (USD)'
    }
  ]
};

module('Integration | Component | table', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = true;

    this.set('model', Model);
    this.set('options', Options);
    this.set('onUpdateReport', () => {});

    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  hooks.afterEach(function() {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = false;
  });

  test('it renders', async function(assert) {
    assert.expect(3);

    await render(TEMPLATE);

    assert.dom('.table-widget').isVisible('The table widget component is visible');

    let headers = findAll('.table-header-row-vc--view .table-header-cell').map(el => el.textContent.trim());

    assert.deepEqual(
      headers,
      ['Date', 'Operating System', 'Unique Identifiers', 'Total Page Views', 'Platform Revenue (USD)'],
      'The table renders the headers correctly based on the request'
    );
    let body = findAll('tbody tr').map(row =>
      [...row.querySelectorAll('.table-cell')].map(cell => cell.textContent.trim())
    );

    assert.deepEqual(
      body,
      [
        ['05/30/2016', 'All Other', '172,933,788', '3,669,828,357', '--'],
        ['06/10/2016', 'All Other', '172,933,788', '3,669,828,357', '--'],
        ['05/30/2016', 'Android', '183,206,656', '4,088,487,125', '--'],
        ['05/30/2016', 'BlackBerry OS', '183,380,921', '4,024,700,302', '--'],
        ['05/30/2016', 'Chrome OS', '180,559,793', '3,950,276,031', '--'],
        ['05/30/2016', 'Firefox OS', '172,724,594', '3,697,156,058', '--'],
        ['05/30/2016', 'Apple Mac OS X', '152,298,735', '3,008,425,744', '--'],
        ['05/30/2016', 'Unknown', '155,191,081', '3,072,620,639', '--']
      ],
      'The table renders the response dataset correctly'
    );
  });

  test('onUpdateReport', async function(assert) {
    assert.expect(9);

    this.set(
      'options',
      merge({}, Options, {
        columns: [
          {
            attributes: { name: 'dateTime' },
            type: 'dateTime',
            displayName: 'Date'
          },
          {
            attributes: { name: 'os' },
            type: 'dimension',
            displayName: 'Operating System'
          },
          {
            attributes: { name: 'uniqueIdentifier', parameters: {} },
            type: 'metric',
            displayName: 'Unique Identifiers'
          },
          {
            attributes: { name: 'totalPageViews', parameters: {} },
            type: 'metric',
            displayName: 'Total Page Views'
          },
          {
            attributes: { name: 'platformRevenue', parameters: { currency: 'USD' } },
            type: 'metric',
            displayName: 'Platform Revenue (USD)'
          },
          {
            attributes: { name: 'totalPageViewsWoW', parameters: {} },
            type: 'threshold',
            displayName: 'Total Page Views WoW'
          }
        ]
      })
    );

    this.set('onUpdateReport', () => {
      assert.notok(true, 'onUpdateReport should not be called when a dimension header is clicked');
    });

    await render(TEMPLATE);
    await click('.table-header-row-vc--view .table-header-cell.dimension');

    this.set('onUpdateReport', (actionType, metricName, direction) => {
      assert.equal(actionType, 'upsertSort', 'the action type is `upsertSort`');

      assert.equal(metricName, 'dateTime', 'The dateTime field is passed along when the dateTime header is clicked');

      assert.equal(direction, 'asc', 'The asc direction is passed along when the dateTime header is clicked');
    });

    await click('.table-header-row-vc--view .table-header-cell.dateTime');

    this.set('onUpdateReport', (actionType, metricName, direction) => {
      assert.equal(actionType, 'upsertSort', 'the action type is `upsertSort`');

      assert.deepEqual(
        metricName,
        'totalPageViews',
        'The totalPageViews metric is passed along when the dateTime header is clicked'
      );

      assert.equal(direction, 'desc', 'The desc direction is passed along when the dateTime header is clicked');
    });

    await click($('.table-header-row-vc--view .table-header-cell.metric:contains(Total Page Views)')[0]);

    this.set('onUpdateReport', (actionType, metricName, direction) => {
      assert.equal(actionType, 'upsertSort', 'the action type is `upsertSort`');

      assert.deepEqual(
        metricName,
        'totalPageViewsWoW',
        'The totalPageViewsWoW metric is passed along when the dateTime header is clicked'
      );

      assert.equal(direction, 'desc', 'The desc direction is passed along when the dateTime header is clicked');
    });

    await click($('.table-header-row-vc--view .table-header-cell.threshold:contains(Total Page Views WoW)')[0]);
  });

  test('grand total in table', async function(assert) {
    assert.expect(3);

    let options = merge({}, Options, { showTotals: { grandTotal: true } });
    this.set('options', options);

    await render(TEMPLATE);

    assert.dom('.table-row__total-row').isVisible('The total row is visible when show grand total is `true`');

    let totalRow = findAll('.table-row__total-row .table-cell').map(cell => cell.textContent.trim());

    assert.deepEqual(
      totalRow,
      ['Grand Total', '--', '1,373,229,356', '29,181,322,613', '0'],
      'The table renders the grand total row correctly'
    );

    //Turn off the flag
    set(this, 'options.showTotals.grandTotal', false);

    await settled();

    assert.dom('.table-row__total-row').isNotVisible('The total row is not visible when show grand total is `false`');
  });

  test('subtotals in table', async function(assert) {
    assert.expect(2);

    let options = merge({}, Options, { showTotals: { subtotal: 'os' } });

    set(Model, 'firstObject.response.rows', ROWS.slice(0, 4));
    this.set('model', Model);
    this.set('options', options);

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.table-row__total-row').map(el => el.textContent.replace(/\s+/g, ' ').trim()),
      [
        'Subtotal All Other 345,867,576 7,339,656,714 0',
        'Subtotal Android 183,206,656 4,088,487,125 0',
        'Subtotal BlackBerry OS 183,380,921 4,024,700,302 0'
      ],
      'The subtotal rows are visible for each group of the specified subtotal in the options'
    );

    let newOptions = merge({}, options, { showTotals: { grandTotal: true } });
    this.set('options', newOptions);

    await settled();
    assert.deepEqual(
      findAll('.table-row__total-row').map(el => el.textContent.replace(/\s+/g, ' ').trim()),
      [
        'Subtotal All Other 345,867,576 7,339,656,714 0',
        'Subtotal Android 183,206,656 4,088,487,125 0',
        'Subtotal BlackBerry OS 183,380,921 4,024,700,302 0',
        'Grand Total -- 712,455,153 15,452,844,141 0'
      ],
      'The total rows including grandTotal are visible along with the subtotals'
    );
  });

  test('subtotals by date in table', async function(assert) {
    assert.expect(1);

    let options = merge({}, Options, { showTotals: { subtotal: 'dateTime' } });

    set(Model, 'firstObject.response.rows', ROWS.slice(0, 4));
    this.set('model', Model);
    this.set('options', options);

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.table-row__total-row').map(el => el.textContent.replace(/\s+/g, ' ').trim()),
      ['Subtotal -- 539,521,365 11,783,015,784 0', 'Subtotal -- 172,933,788 3,669,828,357 0'],
      'The subtotal rows are visible for each group of the specified subtotal in the options'
    );
  });

  test('table row info', async function(assert) {
    assert.expect(1);

    set(Model, 'firstObject.response.rows', ROWS.slice(0, 4));
    set(Model, 'firstObject.response.meta', {
      pagination: {
        numberOfResults: 10
      }
    });

    await render(TEMPLATE);

    assert.equal(
      find('.table-widget__row-info')
        .textContent.replace(/\s+/g, ' ')
        .trim(),
      '4 out of 10 rows',
      'The row info is always shown'
    );
  });

  test('totals and subtotals for partial data', async function(assert) {
    assert.expect(1);

    set(Model, 'firstObject.response.rows', ROWS.slice(0, 4));
    set(Model, 'firstObject.response.meta', {
      pagination: {
        numberOfResults: 10
      }
    });

    let options = merge({}, Options, {
      showTotals: { grandTotal: true, subtotal: 'os' }
    });

    this.set('options', options);
    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.table-row__total-row').map(el => el.textContent.replace(/\s+/g, ' ').trim()),
      [
        'Subtotal All Other -- -- --',
        'Subtotal Android -- -- --',
        'Subtotal BlackBerry OS -- -- --',
        'Grand Total -- -- -- --'
      ],
      'The metric totals are not calculated when only partial data is displayed in table'
    );
  });

  test('sort icon for a parameterized metric', async function(assert) {
    assert.expect(2);

    this.set('model', Model);
    await render(TEMPLATE);

    assert.ok(
      $('.table-header-cell:contains(Platform Revenue) .navi-table-sort-icon--desc').is(':visible'),
      'The right sort metric is recognized from the alias'
    );

    assert.ok(
      $('.table-header-cell:contains(Unique Identifiers) .navi-table-sort-icon--asc').is(':visible'),
      'Even if not an alias, the correct sort metric is recognized'
    );
  });

  test('table header cell display name', async function(assert) {
    assert.expect(2);

    this.set(
      'options',
      merge({}, Options, {
        columns: [
          {
            field: 'dateTime',
            type: 'dateTime',
            displayName: 'Customize Date'
          }
        ]
      })
    );
    await render(TEMPLATE);

    assert.ok(
      $('.table-header-cell:contains(Customize Date)').is(':visible'),
      'Customize Date should be shown as title in dateTime field'
    );

    this.set(
      'options',
      merge({}, Options, {
        columns: [
          {
            field: 'dateTime',
            type: 'dateTime',
            displayName: ''
          }
        ]
      })
    );

    await settled();
    assert.ok($('.table-header-cell:contains(Date)').is(':visible'), 'Date should be shown as title in dateTime field');
  });
});
