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

let Model;

let Options;

let MetadataService, Store;

module('Integration | Component | table', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = true;
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:navi-metadata');

    Model = arr([
      {
        request: Store.createFragment('bard-request-v2/request', {
          dataSource: 'bardOne',
          requestVersion: '2.0',
          table: 'network',
          columns: [
            {
              cid: 'cid_dateTime',
              type: 'timeDimension',
              field: 'network.dateTime',
              parameters: { grain: 'day' },
              source: 'bardOne'
            },
            { cid: 'cid_osId', type: 'dimension', field: 'os', parameters: { field: 'id' }, source: 'bardOne' },
            { type: 'dimension', field: 'os', parameters: { field: 'desc' }, source: 'bardOne' },
            { type: 'metric', field: 'uniqueIdentifier', parameters: {}, source: 'bardOne' },
            { type: 'metric', field: 'totalPageViews', parameters: {}, source: 'bardOne' },
            { type: 'metric', field: 'platformRevenue', parameters: { currency: 'USD' }, source: 'bardOne' }
          ],
          sorts: [
            {
              type: 'timeDimension',
              field: 'network.dateTime',
              parameters: { grain: 'day' },
              direction: 'desc',
              source: 'bardTwo'
            },
            {
              type: 'metric',
              field: 'platformRevenue',
              parameters: { currency: 'USD' },
              direction: 'desc',
              source: 'bardOne'
            },
            { type: 'metric', field: 'uniqueIdentifier', parameters: {}, direction: 'asc', source: 'bardOne' }
          ]
        }),
        response: {
          rows: ROWS
        }
      }
    ]);
    Options = {
      columnAttributes: {}
    };
    this.set('model', Model);
    this.set('options', Options);
    this.set('onUpdateReport', () => undefined);

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
        'Date Time (day)',
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
        ['05/30/2016', 'All Other', 'All Other', '172933788', '3669828357', '--'],
        ['06/10/2016', 'All Other', 'All Other', '172933788', '3669828357', '--'],
        ['05/30/2016', 'Android', 'Android', '183206656', '4088487125', '--'],
        ['05/30/2016', 'BlackBerry', 'BlackBerry OS', '183380921', '4024700302', '--'],
        ['05/30/2016', 'ChromeOS', 'Chrome OS', '180559793', '3950276031', '--'],
        ['05/30/2016', 'Firefox', 'Firefox OS', '172724594', '3697156058', '--'],
        ['05/30/2016', 'Mac', 'Apple Mac OS X', '152298735', '3008425744', '--'],
        ['05/30/2016', 'Unknown', 'Unknown', '155191081', '3072620639', '--']
      ],
      'The table renders the response dataset correctly'
    );
  });

  test('render alternative datasource', async function(assert) {
    assert.expect(2);
    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardTwo' });
    const model = arr([
      {
        request: Store.createFragment('bard-request-v2/request', {
          dataSource: 'bardTwo',
          requestVersion: '2.0',
          table: 'inventory',
          columns: [
            { type: 'timeDimension', field: 'inventory.dateTime', parameters: { grain: 'day' }, source: 'bardTwo' },
            { type: 'dimension', field: 'container', parameters: { field: 'id' }, source: 'bardTwo' },
            { type: 'dimension', field: 'container', parameters: { field: 'desc' }, source: 'bardTwo' },
            { type: 'metric', field: 'ownedQuantity', parameters: {}, source: 'bardTwo' },
            { type: 'metric', field: 'usedAmount', parameters: {}, source: 'bardTwo' },
            { type: 'metric', field: 'personalSold', parameters: {}, source: 'bardTwo' }
          ],
          sorts: [
            { type: 'metric', field: 'personalSold', parameters: {}, direction: 'desc', source: 'bardTwo' },
            { type: 'metric', field: 'usedAmount', parameters: {}, direction: 'asc', source: 'bardTwo' }
          ]
        }),
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
      columnAttributes: {}
    };

    this.set('model', model);
    this.set('options', options);

    await render(TEMPLATE);

    assert.dom('.table-widget').isVisible('The table widget component is visible');

    let headers = findAll('.table-header-row-vc--view .table-header-cell').map(el => el.textContent.trim());

    assert.deepEqual(
      headers,
      [
        'Date Time (day)',
        'Container (id)',
        'Container (desc)',
        'Quantity of thing',
        'Used Amount',
        'Personally sold amount'
      ],
      'The table renders the headers correctly based on the request'
    );
  });

  test('onUpdateReport', async function(assert) {
    assert.expect(12);

    this.set('onUpdateReport', (actionType, columnFragment, direction) => {
      assert.equal(actionType, 'upsertSort', 'the action type is `upsertSort`');

      assert.deepEqual(
        columnFragment.canonicalName,
        'os(field=id)',
        'The os fragment is passed along when the os header is clicked'
      );

      assert.equal(direction, 'desc', 'The desc direction is passed along when the dateTime header is clicked');
    });

    const totalPageViewWoW = this.model.firstObject.request.addColumn({
      type: 'metric',
      field: 'totalPageViewsWoW',
      parameters: {},
      source: 'bardOne'
    });

    this.options.columnAttributes[this.model.firstObject.request.columns.indexOf(totalPageViewWoW)] = {
      canAggregateSubtotal: false
    };

    await render(TEMPLATE);
    await click('.table-header-row-vc--view .table-header-cell.dimension');

    this.set('onUpdateReport', (actionType, columnFragment, direction) => {
      assert.equal(actionType, 'upsertSort', 'the action type is `upsertSort`');

      assert.equal(
        columnFragment.canonicalName,
        'network.dateTime(grain=day)',
        'The dateTime fragment is passed along when the dateTime header is clicked'
      );

      assert.equal(direction, 'asc', 'The asc direction is passed along when the dateTime header is clicked');
    });

    await click('.table-header-row-vc--view .table-header-cell.timeDimension');

    this.set('onUpdateReport', (actionType, columnFragment, direction) => {
      assert.equal(actionType, 'upsertSort', 'the action type is `upsertSort`');

      assert.deepEqual(
        columnFragment.canonicalName,
        'totalPageViews',
        'The totalPageViews metric is passed along when the totalPageViews header is clicked'
      );

      assert.equal(direction, 'desc', 'The desc direction is passed along when the dateTime header is clicked');
    });

    await click($('.table-header-row-vc--view .table-header-cell.metric:contains(Total Page Views)')[0]);

    this.set('onUpdateReport', (actionType, columnFragment, direction) => {
      assert.equal(actionType, 'upsertSort', 'the action type is `upsertSort`');

      assert.deepEqual(
        columnFragment.canonicalName,
        'totalPageViewsWoW',
        'The totalPageViewsWoW fragment is passed along when the totalPageViewsWoW header is clicked'
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
      ['Grand Total', '--', '--', '1373229356', '29181322613', '0'],
      'The table renders the grand total row correctly'
    );

    //Turn off the flag
    set(this, 'options.showTotals.grandTotal', false);

    await waitUntil(() => find('.table-row__total-row') == null, { timeout: 1000 });

    assert.dom('.table-row__total-row').isNotVisible('The total row is not visible when show grand total is `false`');
  });

  test('subtotals in table', async function(assert) {
    assert.expect(2);

    let options = merge({}, Options, { showTotals: { subtotal: 'cid_osId' } });

    set(Model, 'firstObject.response.rows', ROWS.slice(0, 4));
    this.set('model', Model);
    this.set('options', options);

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.table-row__total-row').map(el => el.textContent.replace(/\s+/g, ' ').trim()),
      [
        'Subtotal All Other -- 345867576 7339656714 0',
        'Subtotal Android -- 183206656 4088487125 0',
        'Subtotal BlackBerry -- 183380921 4024700302 0'
      ],
      'The subtotal rows are visible for each group of the specified subtotal in the options'
    );

    let newOptions = merge({}, options, { showTotals: { grandTotal: true } });
    this.set('options', newOptions);

    await settled();
    assert.deepEqual(
      findAll('.table-row__total-row').map(el => el.textContent.replace(/\s+/g, ' ').trim()),
      [
        'Subtotal All Other -- 345867576 7339656714 0',
        'Subtotal Android -- 183206656 4088487125 0',
        'Subtotal BlackBerry -- 183380921 4024700302 0',
        'Grand Total -- -- 712455153 15452844141 0'
      ],
      'The total rows including grandTotal are visible along with the subtotals'
    );
  });

  test('subtotals by date in table', async function(assert) {
    assert.expect(1);

    let options = merge({}, Options, { showTotals: { subtotal: 'cid_dateTime' } });

    set(Model, 'firstObject.response.rows', ROWS.slice(0, 4));
    this.set('model', Model);
    this.set('options', options);

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.table-row__total-row').map(el => el.textContent.replace(/\s+/g, ' ').trim()),
      ['Subtotal -- -- 539521365 11783015784 0', 'Subtotal -- -- 172933788 3669828357 0'],
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
      showTotals: { grandTotal: true, subtotal: 'cid_osId' }
    });

    this.set('options', options);
    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.table-row__total-row').map(el => el.textContent.replace(/\s+/g, ' ').trim()),
      [
        'Subtotal All Other -- -- -- --',
        'Subtotal Android -- -- -- --',
        'Subtotal BlackBerry -- -- -- --',
        'Grand Total -- -- -- -- --'
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

    Model.firstObject.request.columns.objectAt(0).alias = 'Customize Date';
    await render(TEMPLATE);

    assert.ok(
      $('.table-header-cell:contains(Customize Date)').is(':visible'),
      'Customize Date should be shown as title in dateTime field'
    );

    Model.firstObject.request.columns.objectAt(0).alias = null;

    await settled();
    assert.ok($('.table-header-cell:contains(Date)').is(':visible'), 'Date should be shown as title in dateTime field');
  });
});
