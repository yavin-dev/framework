import { set } from '@ember/object';
import { A } from '@ember/array';
import { helper as buildHelper } from '@ember/component/helper';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { merge } from 'lodash-es';
import { createGlimmerComponent, createGlimmerClass } from 'navi-core/test-support';
import NaviVisualizationsTable from 'navi-core/components/navi-visualizations/table';

const ROWS = [
  {
    'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
    'age(field=id)': 'dim1',
    uniqueIdentifier: 172933788,
  },
  {
    'network.dateTime(grain=day)': '2016-05-31 00:00:00.000',
    'age(field=id)': 'dim2',
    uniqueIdentifier: 183206656,
  },
];

let MODEL;

const OPTIONS = {
  columnAttributes: {},
};

module('Unit | Component | table', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    ['navi-table-sort-icon', 'sortable-group', 'sortable-item', 'navi-icon', 'ember-tooltip'].forEach((component) => {
      this.owner.register(`component:${component}`, class extends Component {}, { instantiate: false });
    });

    //helpers
    ['and', 'sub', 'not-eq', 'is-valid-moment', 'format-number'].forEach((helper) => {
      this.owner.register(
        `helper:${helper}`,
        buildHelper(() => undefined),
        { instantiate: false }
      );
    });

    await this.owner.lookup('service:navi-metadata').loadMetadata();

    MODEL = A([
      {
        request: store.createFragment('request', {
          table: 'network',
          columns: [
            {
              type: 'timeDimension',
              field: 'network.dateTime',
              parameters: { grain: 'day' },
              source: 'bardOne',
            },
            {
              cid: 'cid_age',
              type: 'dimension',
              field: 'age',
              parameters: { field: 'id' },
              source: 'bardOne',
            },
            {
              type: 'metric',
              field: 'uniqueIdentifier',
              parameters: {},
              source: 'bardOne',
            },
          ],
          sorts: [
            {
              type: 'timeDimension',
              field: 'network.dateTime',
              parameters: { grain: 'day' },
              direction: 'desc',
              source: 'bardOne',
            },
          ],
          filters: [],
          limit: null,
          requestVersion: '2.0',
          dataSource: 'bardOne',
        }),
        response: {
          rows: ROWS,
        },
      },
    ]);
  });

  test('columns', function (assert) {
    assert.expect(2);

    let component = createGlimmerComponent('component:navi-visualizations/table', {
        model: MODEL,
        options: OPTIONS,
      }),
      dateTimeColumn = A(component.columns).filterBy('fragment.type', 'timeDimension')[0],
      metricColumn = A(component.columns).filterBy('fragment.type', 'metric')[0];

    assert.equal(
      dateTimeColumn.sortDirection,
      'desc',
      'sort direction is fetched from the request and updated in the columns property'
    );

    assert.equal(metricColumn.sortDirection, 'none', 'sort direction is set to none as default for metric column');
  });

  test('datetime _getNextSortDirection', function (assert) {
    assert.expect(2);

    let component = createGlimmerComponent('component:navi-visualizations/table', {
      model: MODEL,
      options: OPTIONS,
    });

    assert.equal(
      component._getNextSortDirection('timeDimension', 'asc'),
      'none',
      'next sort direction for dateTime asc is none'
    );

    assert.equal(
      component._getNextSortDirection('timeDimension', 'desc'),
      'asc',
      'next sort direction for dateTime desc is asc'
    );
  });

  test('metric _getNextSortDirection', function (assert) {
    assert.expect(3);

    let component = createGlimmerComponent('component:navi-visualizations/table', {
      model: MODEL,
      options: OPTIONS,
    });

    assert.equal(
      component._getNextSortDirection('metric', 'none'),
      'desc',
      'next sort direction for metric none is asc'
    );

    assert.equal(
      component._getNextSortDirection('metric', 'desc'),
      'asc',
      'next sort direction for metric desc is none'
    );

    assert.equal(
      component._getNextSortDirection('metric', 'asc'),
      'none',
      'next sort direction for metric asc is desc'
    );
  });

  test('table data changes with options', function (assert) {
    assert.expect(4);

    let component = createGlimmerComponent('component:navi-visualizations/table', {
      model: MODEL,
      options: OPTIONS,
    });

    assert.deepEqual(
      component.tableData,
      ROWS,
      'table data is the same as the response rows when the flag in the options is not set'
    );

    set(OPTIONS, 'showTotals', { grandTotal: true });

    assert.deepEqual(
      component.tableData[component.tableData.length - 1],
      {
        'network.dateTime(grain=day)': 'Grand Total',
        __meta__: {
          hasPartialData: false,
          isTotalRow: true,
        },
        uniqueIdentifier: 356140444,
      },
      'table data has the total row appended when the flag in the options is set'
    );

    set(OPTIONS, 'showTotals', { subtotal: 'cid_age' });

    assert.deepEqual(
      component.tableData,
      [
        {
          'age(field=id)': 'dim1',
          'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
          uniqueIdentifier: 172933788,
        },
        {
          __meta__: {
            hasPartialData: false,
            isTotalRow: true,
          },
          'age(field=id)': 'dim1',
          'network.dateTime(grain=day)': 'Subtotal',
          uniqueIdentifier: 172933788,
        },
        {
          'age(field=id)': 'dim2',
          'network.dateTime(grain=day)': '2016-05-31 00:00:00.000',
          uniqueIdentifier: 183206656,
        },
        {
          __meta__: {
            hasPartialData: false,
            isTotalRow: true,
          },
          'age(field=id)': 'dim2',
          'network.dateTime(grain=day)': 'Subtotal',
          uniqueIdentifier: 183206656,
        },
      ],
      'table data has the subtotal row appended after every group of data'
    );

    set(OPTIONS, 'showTotals', { subtotal: 'cid_age', grandTotal: true });

    assert.deepEqual(
      component.tableData,
      [
        {
          'age(field=id)': 'dim1',
          'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
          uniqueIdentifier: 172933788,
        },
        {
          __meta__: {
            hasPartialData: false,
            isTotalRow: true,
          },
          'age(field=id)': 'dim1',
          'network.dateTime(grain=day)': 'Subtotal',
          uniqueIdentifier: 172933788,
        },
        {
          'age(field=id)': 'dim2',
          'network.dateTime(grain=day)': '2016-05-31 00:00:00.000',
          uniqueIdentifier: 183206656,
        },
        {
          __meta__: {
            hasPartialData: false,
            isTotalRow: true,
          },
          'age(field=id)': 'dim2',
          'network.dateTime(grain=day)': 'Subtotal',
          uniqueIdentifier: 183206656,
        },
        {
          __meta__: {
            hasPartialData: false,
            isTotalRow: true,
          },
          'network.dateTime(grain=day)': 'Grand Total',
          uniqueIdentifier: 356140444,
        },
      ],
      'table data has the subtotal row appended after every group of data'
    );
  });

  test('computeTotal and computeSubtotals', function (assert) {
    assert.expect(2);

    let options = merge({}, OPTIONS, { showTotals: { subtotal: 'cid_age' } }),
      component = createGlimmerComponent('component:navi-visualizations/table', {
        options,
        model: MODEL,
      });

    assert.deepEqual(
      component._computeSubtotals(),
      [
        {
          'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
          'age(field=id)': 'dim1',
          uniqueIdentifier: 172933788,
        },
        {
          'network.dateTime(grain=day)': 'Subtotal',
          __meta__: {
            hasPartialData: false,
            isTotalRow: true,
          },
          'age(field=id)': 'dim1',
          uniqueIdentifier: 172933788,
        },
        {
          'network.dateTime(grain=day)': '2016-05-31 00:00:00.000',
          'age(field=id)': 'dim2',
          uniqueIdentifier: 183206656,
        },
        {
          'network.dateTime(grain=day)': 'Subtotal',
          __meta__: {
            hasPartialData: false,
            isTotalRow: true,
          },
          'age(field=id)': 'dim2',
          uniqueIdentifier: 183206656,
        },
      ],
      'compute subtotal returns a array of rows grouped and summed based on the specified subtotal dimension in the options'
    );

    assert.deepEqual(
      component._computeTotal(ROWS, 'grandTotal'),
      {
        'network.dateTime(grain=day)': 'Grand Total',
        __meta__: {
          hasPartialData: false,
          isTotalRow: true,
        },
        uniqueIdentifier: 356140444,
      },
      'compute total returns a total row object for the rows passed in'
    );
  });

  test('computeTotal and computeSubtotals with an overriding computeColumnTotal method', function (assert) {
    assert.expect(2);

    let options = merge({}, OPTIONS, { showTotals: { subtotal: 'cid_age' } }),
      component = createGlimmerClass(
        class extends NaviVisualizationsTable {
          computeColumnTotal(data, metricName, totalRow, column, type) {
            return data.reduce((sum, row) => {
              let number = Number(row[metricName]);
              if (!Number.isNaN(number)) {
                return type === 'grandTotal' ? sum + number - 1 : sum + number + 1;
              }
              return sum;
            }, 0);
          }
        },
        {
          options,
          model: MODEL,
        }
      );

    assert.deepEqual(
      component._computeSubtotals(),
      [
        {
          'age(field=id)': 'dim1',
          'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
          uniqueIdentifier: 172933788,
        },
        {
          'network.dateTime(grain=day)': 'Subtotal',
          __meta__: {
            hasPartialData: false,
            isTotalRow: true,
          },
          'age(field=id)': 'dim1',
          uniqueIdentifier: 172933788 + 1,
        },
        {
          'network.dateTime(grain=day)': '2016-05-31 00:00:00.000',
          'age(field=id)': 'dim2',
          uniqueIdentifier: 183206656,
        },
        {
          'network.dateTime(grain=day)': 'Subtotal',
          __meta__: {
            hasPartialData: false,
            isTotalRow: true,
          },
          'age(field=id)': 'dim2',
          uniqueIdentifier: 183206656 + 1,
        },
      ],
      'compute subtotal returns a array of rows grouped and summed based on the overriding method'
    );

    assert.deepEqual(
      component._computeTotal(ROWS, 'grandTotal'),
      {
        'network.dateTime(grain=day)': 'Grand Total',
        __meta__: {
          hasPartialData: false,
          isTotalRow: true,
        },
        uniqueIdentifier: 356140444 - 2,
      },
      'compute total returns a total row object for the rows passed in based on the overriding method'
    );
  });

  test('Rollup visualization', function (assert) {
    assert.expect(2);
    delete OPTIONS.showTotals;
    const model = A([
      {
        request: {
          dataSource: 'bardOne',
          requestVersion: '2.0',
          table: 'network',
          columns: [
            {
              cid: 'cid_dateTime',
              type: 'timeDimension',
              field: 'network.dateTime',
              parameters: { grain: 'day' },
              source: 'bardOne',
            },
            { cid: 'cid_osId', type: 'dimension', field: 'os', parameters: { field: 'id' }, source: 'bardOne' },
            { cid: 'cid_osIddesc', type: 'dimension', field: 'os', parameters: { field: 'desc' }, source: 'bardOne' },
            { type: 'metric', field: 'uniqueIdentifier', parameters: {}, source: 'bardOne' },
          ],
          sorts: [{ type: 'metric', field: 'uniqueIdentifier', parameters: {}, direction: 'asc', source: 'bardOne' }],
          rollup: {
            columnCids: ['cid_osId'],
            grandTotal: true,
          },
        },
        response: {
          rows: [
            {
              'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
              'os|id': 'dim1',
              uniqueIdentifier: 123,
              __rollupMask: '3',
            },
            {
              'network.dateTime(grain=day)': null,
              'os|id': 'dim1',
              uniqueIdentifier: 123,
              __rollupMask: '1',
            },
            {
              'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
              'os|id': 'dim2',
              uniqueIdentifier: 321,
              __rollupMask: '3',
            },
            {
              'network.dateTime(grain=day)': null,
              'os|id': 'dim2',
              uniqueIdentifier: 321,
              __rollupMask: '1',
            },
            {
              'network.dateTime(grain=day)': null,
              'os|id': null,
              uniqueIdentifier: 321,
              __rollupMask: '0',
            },
          ],
        },
      },
    ]);

    const component = createGlimmerComponent('component:navi-visualizations/table', {
      options: OPTIONS,
      model,
    });

    const rollupRows = component.tableData.map((row) => !!row.__meta__.isRollup);

    assert.deepEqual(rollupRows, [false, true, false, true, true], 'Correct rows are identified as rollup rows');

    const grandTotalRows = component.tableData.map((row) => !!row.__meta__.isGrandTotal);

    assert.deepEqual(
      grandTotalRows,
      [false, false, false, false, true],
      'Correct rows are identified as grand total rows'
    );
  });
});
