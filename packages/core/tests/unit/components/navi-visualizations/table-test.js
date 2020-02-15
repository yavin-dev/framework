import { set } from '@ember/object';
import { A } from '@ember/array';
import { helper as buildHelper } from '@ember/component/helper';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { merge } from 'lodash-es';

module('Unit | Component | table', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.owner.register('component:navi-table-sort-icon', Component.extend(), {
      instantiate: false
    });
    this.owner.register('component:sortable-group', Component.extend(), {
      instantiate: false
    });
    this.owner.register('component:sortable-item', Component.extend(), {
      instantiate: false
    });
    this.owner.register('component:navi-icon', Component.extend(), {
      instantiate: false
    });
    this.owner.register('component:ember-tooltip', Component.extend(), {
      instantiate: false
    });

    //helpers
    this.owner.register('helper:and', buildHelper(() => {}), {
      instantiate: false
    });
    this.owner.register('helper:sub', buildHelper(() => {}), {
      instantiate: false
    });
    this.owner.register('helper:not-eq', buildHelper(() => {}), {
      instantiate: false
    });
    this.owner.register('helper:is-valid-moment', buildHelper(() => {}), {
      instantiate: false
    });
    this.owner.register('helper:format-number', buildHelper(() => {}), {
      instantiate: false
    });

    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  const ROWS = [
    {
      dateTime: '2016-05-30 00:00:00.000',
      'dimension|id': 'dim1',
      uniqueIdentifier: 172933788
    },
    {
      dateTime: '2016-05-31 00:00:00.000',
      'dimension|id': 'dim2',
      uniqueIdentifier: 183206656
    }
  ];

  const MODEL = A([
    {
      request: {
        metrics: [
          {
            metric: 'uniqueIdentifier',
            parameters: {},
            toJSON() {
              return { metric: 'uniqueIdentifier', parameters: {} };
            }
          }
        ],
        logicalTable: { table: 'network', timeGrain: 'day' },
        sort: [{ metric: 'dateTime', direction: 'desc' }]
      },
      response: {
        rows: ROWS
      }
    }
  ]);

  const OPTIONS = {
    columns: [
      { attributes: { name: 'dateTime' }, type: 'dateTime', displayName: 'Date' },
      {
        attributes: { name: 'uniqueIdentifier', parameters: {} },
        type: 'metric',
        displayName: 'Unique Identifiers'
      },
      {
        attributes: { name: 'totalPageViewsWoW', parameters: {} },
        type: 'threshold',
        displayName: 'Total Page Views WoW'
      }
    ]
  };

  test('columns', function(assert) {
    assert.expect(3);

    let component = this.owner.factoryFor('component:navi-visualizations/table').create({
        model: MODEL,
        options: OPTIONS
      }),
      dateTimeColumn = A(component.get('columns')).filterBy('type', 'dateTime')[0],
      metricColumn = A(component.get('columns')).filterBy('type', 'metric')[0],
      thresholdColumn = A(component.get('columns')).filterBy('type', 'threshold')[0];

    assert.equal(
      dateTimeColumn.sortDirection,
      'desc',
      'sort direction is fetched from the request and updated in the columns property'
    );

    assert.equal(metricColumn.sortDirection, 'none', 'sort direction is set to none as default for metric column');

    assert.equal(
      thresholdColumn.sortDirection,
      'none',
      'sort direction is set to none as default for threshold column'
    );
  });

  test('datetime _getNextSortDirection', function(assert) {
    assert.expect(2);

    let component = this.owner.factoryFor('component:navi-visualizations/table').create({
      model: MODEL,
      options: OPTIONS
    });

    assert.equal(
      component._getNextSortDirection('dateTime', 'asc'),
      'desc',
      'next sort direction for dateTime asc is desc'
    );

    assert.equal(
      component._getNextSortDirection('dateTime', 'desc'),
      'asc',
      'next sort direction for dateTime desc is asc'
    );
  });

  test('metric _getNextSortDirection', function(assert) {
    assert.expect(3);

    let component = this.owner.factoryFor('component:navi-visualizations/table').create({
      model: MODEL,
      options: OPTIONS
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

  test('table data changes with options', function(assert) {
    assert.expect(4);

    let component = this.owner.factoryFor('component:navi-visualizations/table').create({
      model: MODEL,
      options: OPTIONS
    });

    assert.deepEqual(
      component.get('tableData'),
      ROWS,
      'table data is the same as the response rows when the flag in the options is not set'
    );

    set(OPTIONS, 'showTotals', { grandTotal: true });

    assert.deepEqual(
      component.get('tableData')[component.get('tableData.length') - 1],
      {
        dateTime: 'Grand Total',
        __meta__: {
          isTotalRow: true
        },
        uniqueIdentifier: 356140444
      },
      'table data has the total row appended when the flag in the options is set'
    );

    set(OPTIONS, 'showTotals', { subtotal: 'dimension' });

    assert.deepEqual(
      component.get('tableData'),
      [
        {
          dateTime: '2016-05-30 00:00:00.000',
          'dimension|id': 'dim1',
          uniqueIdentifier: 172933788
        },
        {
          dateTime: 'Subtotal',
          __meta__: {
            isTotalRow: true
          },
          uniqueIdentifier: 172933788
        },
        {
          dateTime: '2016-05-31 00:00:00.000',
          'dimension|id': 'dim2',
          uniqueIdentifier: 183206656
        },
        {
          dateTime: 'Subtotal',
          __meta__: {
            isTotalRow: true
          },
          uniqueIdentifier: 183206656
        }
      ],
      'table data has the subtotal row appended after every group of data'
    );

    set(OPTIONS, 'showTotals', { subtotal: 'dimension', grandTotal: true });

    assert.deepEqual(
      component.get('tableData'),
      [
        {
          dateTime: '2016-05-30 00:00:00.000',
          'dimension|id': 'dim1',
          uniqueIdentifier: 172933788
        },
        {
          dateTime: 'Subtotal',
          __meta__: {
            isTotalRow: true
          },
          uniqueIdentifier: 172933788
        },
        {
          dateTime: '2016-05-31 00:00:00.000',
          'dimension|id': 'dim2',
          uniqueIdentifier: 183206656
        },
        {
          dateTime: 'Subtotal',
          __meta__: {
            isTotalRow: true
          },
          uniqueIdentifier: 183206656
        },
        {
          dateTime: 'Grand Total',
          __meta__: {
            isTotalRow: true
          },
          uniqueIdentifier: 356140444
        }
      ],
      'table data has the subtotal row appended after every group of data'
    );
  });

  test('computeTotal and computeSubtotals', function(assert) {
    assert.expect(2);

    let options = merge({}, OPTIONS, { showTotals: { subtotal: 'dimension' } }),
      component = this.owner.factoryFor('component:navi-visualizations/table').create({
        options,
        model: A([{ response: { rows: ROWS } }])
      });

    assert.deepEqual(
      component._computeSubtotals(),
      [
        {
          dateTime: '2016-05-30 00:00:00.000',
          'dimension|id': 'dim1',
          uniqueIdentifier: 172933788
        },
        {
          dateTime: 'Subtotal',
          __meta__: {
            isTotalRow: true
          },
          uniqueIdentifier: 172933788
        },
        {
          dateTime: '2016-05-31 00:00:00.000',
          'dimension|id': 'dim2',
          uniqueIdentifier: 183206656
        },
        {
          dateTime: 'Subtotal',
          __meta__: {
            isTotalRow: true
          },
          uniqueIdentifier: 183206656
        }
      ],
      'compute subtotal returns a array of rows grouped and summed based on the specified subtotal dimension in the options'
    );

    assert.deepEqual(
      component._computeTotal(ROWS, 'grandTotal'),
      {
        dateTime: 'Grand Total',
        __meta__: {
          isTotalRow: true
        },
        uniqueIdentifier: 356140444
      },
      'compute total returns a total row object for the rows passed in'
    );
  });

  test('computeTotal and computeSubtotals with an overriding computeColumnTotal method', function(assert) {
    assert.expect(2);

    let computeColumnTotal = function(data, metricName, totalRow, column, type) {
      return data.reduce((sum, row) => {
        let number = Number(row[metricName]);
        if (!Number.isNaN(number)) {
          return type === 'grandTotal' ? sum + number - 1 : sum + number + 1;
        }
        return sum;
      }, 0);
    };

    let options = merge({}, OPTIONS, { showTotals: { subtotal: 'dimension' } }),
      component = this.owner.factoryFor('component:navi-visualizations/table').create({
        options,
        model: A([{ response: { rows: ROWS } }]),
        computeColumnTotal
      });

    assert.deepEqual(
      component._computeSubtotals(),
      [
        {
          dateTime: '2016-05-30 00:00:00.000',
          'dimension|id': 'dim1',
          uniqueIdentifier: 172933788
        },
        {
          dateTime: 'Subtotal',
          __meta__: {
            isTotalRow: true
          },
          uniqueIdentifier: 172933788 + 1
        },
        {
          dateTime: '2016-05-31 00:00:00.000',
          'dimension|id': 'dim2',
          uniqueIdentifier: 183206656
        },
        {
          dateTime: 'Subtotal',
          __meta__: {
            isTotalRow: true
          },
          uniqueIdentifier: 183206656 + 1
        }
      ],
      'compute subtotal returns a array of rows grouped and summed based on the overriding method'
    );

    assert.deepEqual(
      component._computeTotal(ROWS, 'grandTotal'),
      {
        dateTime: 'Grand Total',
        __meta__: {
          isTotalRow: true
        },
        uniqueIdentifier: 356140444 - 2
      },
      'compute total returns a total row object for the rows passed in based on the overriding method'
    );
  });
});
