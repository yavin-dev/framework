import { A } from '@ember/array';
import config from 'ember-get-config';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

const TEMPLATE = hbs`
  <NaviVisualizations::TablePrint
    @model={{this.model}}
    @options={{this.options}}
    @onUpdateReport={{this.onUpdateReport}}
  />`;

const ROWS = [
  {
    'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
    'os(field=id)': 'All Other',
    'os(field=desc)': 'All Other',
    uniqueIdentifier: 172933788,
    totalPageViews: 3669828357,
  },
  {
    'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
    'os(field=id)': 'Android',
    'os(field=desc)': 'Android',
    uniqueIdentifier: 183206656,
    totalPageViews: 4088487125,
  },
  {
    'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
    'os(field=id)': 'BlackBerry',
    'os(field=desc)': 'BlackBerry OS',
    uniqueIdentifier: 183380921,
    totalPageViews: 4024700302,
  },
];

module('Integration | Component | navi visualizations/table print', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = true;

    const store = this.owner.lookup('service:store');

    const Model = A([
      {
        request: store.createFragment('bard-request-v2/request', {
          dataSource: 'bardOne',
          requestVersion: '2.0',
          table: 'network',
          columns: [
            { type: 'timeDimension', field: 'network.dateTime', parameters: { grain: 'day' }, source: 'bardOne' },
            { type: 'dimension', field: 'os', parameters: { field: 'id' }, source: 'bardOne' },
            { type: 'dimension', field: 'os', parameters: { field: 'desc' }, source: 'bardOne' },
            { type: 'metric', field: 'uniqueIdentifier', parameters: {}, source: 'bardOne' },
            { type: 'metric', field: 'totalPageViews', parameters: {}, source: 'bardOne' },
          ],
          sorts: [],
        }),
        response: {
          rows: ROWS,
        },
      },
    ]);

    const Options = {
      columnAttributes: {},
    };
    this.set('model', Model);
    this.set('options', Options);
    this.set('onUpdateReport', () => undefined);

    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  hooks.afterEach(function () {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = false;
  });

  test('it renders', async function (assert) {
    assert.expect(3);

    await render(TEMPLATE);

    assert.dom('.table-widget').isVisible('The table widget component is visible');

    let headers = findAll('.table-header-row-vc div.table-header-cell').map((el) => el.textContent.trim());

    assert.deepEqual(
      headers,
      ['Date Time (day)', 'Operating System (id)', 'Operating System (desc)', 'Unique Identifiers', 'Total Page Views'],
      'The table renders the headers correctly based on the request'
    );

    let body = findAll('tbody tr').map((row) =>
      [...row.querySelectorAll('.table-cell')].map((cell) => cell.textContent.trim())
    );

    assert.deepEqual(
      body,
      [
        ['05/30/2016', 'All Other', 'All Other', '172933788', '3669828357'],
        ['05/30/2016', 'Android', 'Android', '183206656', '4088487125'],
        ['05/30/2016', 'BlackBerry', 'BlackBerry OS', '183380921', '4024700302'],
      ],
      'The table renders the response dataset correctly'
    );
  });
});
