import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
    {{chart-series-collection
       allSeriesData=allSeriesData
       selectedSeriesData=selectedSeriesData
       onRemoveSeries=(action onRemoveSeries)
       onAddSeries=(action onAddSeries)
    }}
    `;

const ALL_SERIES_DATA = [
    {
      dimensions: [
        {
          dimension: {
            name: 'age',
            longName: 'Age'
          },
          value: {
            id: '10',
            description: '10 - 20'
          }
        },
        {
          dimension: {
            name: 'browser',
            longName: 'Browser'
          },
          value: {
            id: 'safari_mobile',
            description: 'Safari Mobile'
          }
        }
      ]
    },
    {
      dimensions: [
        {
          dimension: {
            name: 'age',
            longName: 'Age'
          },
          value: {
            id: '20',
            description: '20 - 30'
          }
        },
        {
          dimension: {
            name: 'browser',
            longName: 'Browser'
          },
          value: {
            id: 'chrome',
            description: 'Chrome'
          }
        }
      ]
    },
    {
      dimensions: [
        {
          dimension: {
            name: 'age',
            longName: 'Age'
          },
          value: {
            id: '20',
            description: '20 - 30'
          }
        },
        {
          dimension: {
            name: 'browser',
            longName: 'Browser'
          },
          value: {
            id: 'firefox',
            description: 'Firefox'
          }
        }
      ]
    },
    {
      dimensions: [
        {
          dimension: {
            name: 'age',
            longName: 'Age'
          },
          value: {
            id: '10',
            description: '10 - 20'
          }
        },
        {
          dimension: {
            name: 'browser',
            longName: 'Browser'
          },
          value: {
            id: 'chrome',
            description: 'Chrome'
          }
        }
      ]
    }
  ],
  SELECTED_SERIES_DATA = [
    {
      dimensions: [
        {
          dimension: {
            name: 'age',
            longName: 'Age'
          },
          value: {
            id: '10',
            description: '10 - 20'
          }
        },
        {
          dimension: {
            name: 'browser',
            longName: 'Browser'
          },
          value: {
            id: 'safari_mobile',
            description: 'Safari Mobile'
          }
        }
      ]
    },
    {
      dimensions: [
        {
          dimension: {
            name: 'age',
            longName: 'Age'
          },
          value: {
            id: '20',
            description: '20 - 30'
          }
        },
        {
          dimension: {
            name: 'browser',
            longName: 'Browser'
          },
          value: {
            id: 'chrome',
            description: 'Chrome'
          }
        }
      ]
    }
  ];

module('Integration | Component | chart series collection', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setProperties({
      allSeriesData: ALL_SERIES_DATA,
      selectedSeriesData: SELECTED_SERIES_DATA,
      onRemoveSeries: () => null,
      onAddSeries: () => null
    });
  });

  test('Component renders list of selected series', async function(assert) {
    assert.expect(4);

    await render(TEMPLATE);

    assert.ok(!!this.$('.chart-series-collection'), 'Chart Series Collection component renders');

    let seriesHeaders = this.$('.series-header')
      .map(function() {
        return this.textContent.trim();
      })
      .get();
    assert.deepEqual(seriesHeaders, ['Series 1', 'Series 2'], 'Collection contains series with appropriate headers');

    let chartSeries = findAll('.chart-series-item')[0],
      expectedDims = SELECTED_SERIES_DATA.map(seriesData => {
        return A(seriesData.dimensions).mapBy('dimension.longName');
      }),
      seriesDimensions = [];

    chartSeries.forEach(series => {
      let dims = $(series)
        .find('.dim-type')
        .map(function() {
          return this.textContent.trim();
        })
        .get();
      seriesDimensions.push(dims);
    });

    assert.deepEqual(seriesDimensions, expectedDims, 'Collection contains series with appropriate dimension types');

    let expectedDimValues = SELECTED_SERIES_DATA.map(seriesData => {
        return seriesData.dimensions.map(dim => {
          return `${dim.value.description} (${dim.value.id})`;
        });
      }),
      dimensionValues = [];

    chartSeries.forEach(series => {
      let dims = $(series)
        .find('.dim-value')
        .map(function() {
          return this.textContent.trim();
        })
        .get();
      dimensionValues.push(dims);
    });

    assert.deepEqual(
      dimensionValues,
      expectedDimValues,
      'Collection contains series with appropriate dimension values'
    );
  });

  test('Deleting series', async function(assert) {
    assert.expect(2);

    await render(TEMPLATE);

    this.set('onRemoveSeries', series => {
      assert.ok(true, 'onRemoveSeries action is triggered');

      assert.deepEqual(series, SELECTED_SERIES_DATA[0], 'appropriate series data is sent to onRemoveSeries action');
    });

    // Delete first series
    this.$('.navi-icon__delete')
      .first()
      .click();
  });

  test('Deleting only available series allows you to select it', async function(assert) {
    assert.expect(1);

    //Set only one available series
    let series = ALL_SERIES_DATA.splice(0, 1);

    this.set('allSeriesData', series);
    this.set('selectedSeriesData', series);
    await render(TEMPLATE);

    //Remove selected series
    this.set('onRemoveSeries', () => {
      this.set('selectedSeriesData', []);
    });

    // Delete series
    this.$('.navi-icon__delete')
      .first()
      .click();

    $('.add-series .btn-add').click();

    let body = $('.table-body .table-cell:not(.table-cell--icon)')
      .toArray()
      .map(el => {
        return $(el)
          .text()
          .trim();
      });

    assert.deepEqual(
      body,
      ['10 - 20 (10)', 'Safari Mobile (safari_mobile)'],
      'deleting only available series allows you to select it'
    );
  });
});
