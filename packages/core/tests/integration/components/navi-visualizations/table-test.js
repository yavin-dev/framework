import config from 'ember-get-config';
import { set } from '@ember/object';
import { A as arr } from '@ember/array';
import { merge } from 'lodash-es';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find, findAll, waitUntil } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import { setupMirage } from 'ember-cli-mirage/test-support';

const TEMPLATE = hbs`
  <div style="width: 800px; height: 800px; display: flex;">
    <NaviVisualizations::Table
      @model={{this.model}}
      @options={{this.options}}
      @bufferSize={{20}}
      @onUpdateReport={{this.onUpdateReport}}
    />
  </div>`;

const ROWS = [
  {
    'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
    'os(field=id)': 'All Other',
    'os(field=desc)': 'All Other',
    uniqueIdentifier: 172933788,
    totalPageViews: 3669828357
  },
  {
    'network.dateTime(grain=day)': '2016-06-10 00:00:00.000',
    'os(field=id)': 'All Other',
    'os(field=desc)': 'All Other',
    uniqueIdentifier: 172933788,
    totalPageViews: 3669828357
  },
  {
    'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
    'os(field=id)': 'Android',
    'os(field=desc)': 'Android',
    uniqueIdentifier: 183206656,
    totalPageViews: 4088487125
  },
  {
    'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
    'os(field=id)': 'BlackBerry',
    'os(field=desc)': 'BlackBerry OS',
    uniqueIdentifier: 183380921,
    totalPageViews: 4024700302
  },
  {
    'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
    'os(field=id)': 'ChromeOS',
    'os(field=desc)': 'Chrome OS',
    uniqueIdentifier: 180559793,
    totalPageViews: 3950276031
  },
  {
    'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
    'os(field=id)': 'Firefox',
    'os(field=desc)': 'Firefox OS',
    uniqueIdentifier: 172724594,
    totalPageViews: 3697156058
  },
  {
    'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
    'os(field=id)': 'Mac',
    'os(field=desc)': 'Apple Mac OS X',
    uniqueIdentifier: 152298735,
    totalPageViews: 3008425744
  },
  {
    'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
    'os(field=id)': 'Unknown',
    'os(field=desc)': 'Unknown',
    uniqueIdentifier: 155191081,
    totalPageViews: 3072620639
  }
];

const Model = arr([
  {
    request: {
      dataSource: 'bardOne',
      requestVersion: '2.0',
      table: 'network',
      columns: [
        { type: 'timeDimension', field: 'network.dateTime', parameters: { grain: 'day' } },
        { type: 'dimension', field: 'os', parameters: {} },
        { type: 'metric', field: 'uniqueIdentifier', parameters: {} },
        { type: 'metric', field: 'totalPageViews', parameters: {} },
        { type: 'metric', field: 'platformRevenue', parameters: { currency: 'USD' } }
      ],
      sorts: [
        { type: 'metric', field: 'platformRevenue', parameters: { currency: 'USD' }, direction: 'desc' },
        { type: 'metric', field: 'uniqueIdentifier', parameters: {}, direction: 'asc' }
      ]
    },
    response: {
      rows: ROWS
    }
  }
]);

const Options = {
  columns: [
    {
      type: 'timeDimension',
      field: 'network.dateTime',
      parameters: { grain: 'day' },
      attributes: {
        displayName: 'Date'
      }
    },
    {
      type: 'dimension',
      field: 'os',
      parameters: { field: 'id' },
      attributes: {
        displayName: 'Operating System (id)'
      }
    },
    {
      type: 'dimension',
      field: 'os',
      parameters: { field: 'desc' },
      attributes: {
        displayName: 'Operating System (desc)'
      }
    },
    {
      type: 'metric',
      field: 'uniqueIdentifier',
      parameters: {},
      attributes: {
        displayName: 'Unique Identifiers'
      }
    },
    {
      type: 'metric',
      field: 'totalPageViews',
      parameters: {},
      attributes: {
        displayName: 'Total Page Views'
      }
    },
    {
      type: 'metric',
      field: 'platformRevenue',
      parameters: { currency: 'USD' },
      attributes: {
        displayName: 'Platform Revenue (USD)'
      }
    }
  ]
};

let MetadataService;

module('Integration | Component | table', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = true;

    this.set('model', Model);
    this.set('options', Options);
    this.set('onUpdateReport', () => undefined);

    MetadataService = this.owner.lookup('service:navi-metadata');

    await MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = false;
    return MetadataService.keg.reset();
  });

  test('it renders', async function(assert) {
    assert.expect(3);

    await render(TEMPLATE);

    assert.dom('.table-widget').isVisible('The table widget component is visible');

    let headers = findAll('.table-header-row-vc--view .table-header-cell').map(el => el.textContent.trim());

    assert.deepEqual(
      headers,
      [
        'Date',
        'Operating System (id)',
        'Operating System (desc)',
        'Unique Identifiers',
        'Total Page Views',
        'Platform Revenue (USD)'
      ],
      'The table renders the headers correctly based on the request'
    );
    let body = findAll('tbody tr').map(row =>
      [...row.querySelectorAll('.table-cell')].map(cell => cell.textContent.trim())
    );

    assert.deepEqual(
      body,
      [
        ['05/30/2016', 'All Other', 'All Other', '172,933,788', '3,669,828,357', '--'],
        ['06/10/2016', 'All Other', 'All Other', '172,933,788', '3,669,828,357', '--'],
        ['05/30/2016', 'Android', 'Android', '183,206,656', '4,088,487,125', '--'],
        ['05/30/2016', 'BlackBerry', 'BlackBerry OS', '183,380,921', '4,024,700,302', '--'],
        ['05/30/2016', 'ChromeOS', 'Chrome OS', '180,559,793', '3,950,276,031', '--'],
        ['05/30/2016', 'Firefox', 'Firefox OS', '172,724,594', '3,697,156,058', '--'],
        ['05/30/2016', 'Mac', 'Apple Mac OS X', '152,298,735', '3,008,425,744', '--'],
        ['05/30/2016', 'Unknown', 'Unknown', '155,191,081', '3,072,620,639', '--']
      ],
      'The table renders the response dataset correctly'
    );
  });

  test('render alternative datasource', async function(assert) {
    assert.expect(2);
    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardTwo' });
    const model = arr([
      {
        request: {
          dataSource: 'bardTwo',
          requestVersion: '2.0',
          table: 'inventory',
          columns: [
            { type: 'timeDimension', field: 'inventory.dateTime', parameters: { grain: 'day' } },
            { type: 'dimension', field: 'container', parameters: {} },
            { type: 'metric', field: 'ownedQuantity', parameters: {} },
            { type: 'metric', field: 'usedAmount', parameters: {} },
            { type: 'metric', field: 'personalSold', parameters: {} }
          ],
          sorts: [
            { type: 'metric', field: 'personalSold', parameters: {}, direction: 'desc' },
            { type: 'metric', field: 'usedAmount', parameters: {}, direction: 'asc' }
          ]
        },
        response: {
          rows: [
            {
              'inventory.dateTime(grain=day)': '2016-05-30 00:00:00.000',
              'container(field=id)': '1',
              'container(field=desc)': 'Bag',
              ownedQuantity: 172933788,
              usedAmount: 3669828357
            },
            {
              'inventory.dateTime(grain=day)': '2016-06-10 00:00:00.000',
              'container(field=id)': '1',
              'container(field=desc)': 'Bag',
              ownedQuantity: 172933788,
              usedAmount: 3669828357
            },
            {
              'inventory.dateTime(grain=day)': '2016-05-30 00:00:00.000',
              'container(field=id)': '2',
              'container(field=desc)': 'Bank',
              ownedQuantity: 183206656,
              usedAmount: 4088487125
            }
          ]
        }
      }
    ]);

    const options = {
      columns: [
        {
          type: 'timeDimension',
          field: 'inventory.dateTime',
          parameters: { grain: 'day' },
          attributes: {
            displayName: 'Date'
          }
        },
        {
          type: 'dimension',
          field: 'container',
          parameters: {},
          attributes: {
            displayName: 'Container'
          }
        },
        {
          type: 'metric',
          field: 'ownedQuantity',
          parameters: {},
          attributes: {
            displayName: 'Quantity Owned'
          }
        },
        {
          type: 'metric',
          field: 'usedAmount',
          parameters: {},
          attributes: {
            displayName: 'Amount Used'
          }
        },
        {
          type: 'metric',
          field: 'personalSold',
          parameters: {},
          attributes: {
            displayName: 'Amount personally sold'
          }
        }
      ]
    };

    this.set('model', model);
    this.set('options', options);

    await render(TEMPLATE);

    assert.dom('.table-widget').isVisible('The table widget component is visible');

    let headers = findAll('.table-header-row-vc--view .table-header-cell').map(el => el.textContent.trim());

    assert.deepEqual(
      headers,
      ['Date', 'Container', 'Quantity Owned', 'Amount Used', 'Amount personally sold'],
      'The table renders the headers correctly based on the request'
    );
  });

  test('onUpdateReport', async function(assert) {
    assert.expect(9);

    this.set(
      'options',
      merge({}, Options, {
        columns: [
          ...Options.columns,
          {
            type: 'metric',
            field: 'totalPageViewsWoW',
            parameters: {},
            attributes: {
              displayName: 'Total Page Views WoW',
              canAggregateSubtotal: false
            }
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

      assert.equal(
        metricName,
        'network.dateTime(grain=day)',
        'The dateTime field is passed along when the dateTime header is clicked'
      );

      assert.equal(direction, 'asc', 'The asc direction is passed along when the dateTime header is clicked');
    });

    await click('.table-header-row-vc--view .table-header-cell.timeDimension');

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

    await click($('.table-header-row-vc--view .table-header-cell.metric:contains(Total Page Views WoW)')[0]);
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

    await waitUntil(() => find('.table-row__total-row') == null, { timeout: 1000 });

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
