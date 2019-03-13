import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
        {{series-selector
            availableSeriesData=availableSeriesData
            seriesDimensions=seriesDimensions
            selectionIndex=14
            searchTermDelay=0
            disableAdd=disableAdd
            addSeries=(action addSeries)
        }}
    `;

const AVAILABLE_SERIES_DATA = A([
  {
    searchKey: '10 10 - 20 safari_mobile Safari Mobile',
    dimensions: [
      {
        dimension: { longName: 'Age' },
        value: { id: '10', description: '10 - 20' }
      },
      {
        dimension: { longName: 'Browser' },
        value: { id: 'safari_mobile', description: 'Safari Mobile' }
      }
    ]
  },
  {
    searchKey: '20 20 - 30 chrome Chrome',
    dimensions: [
      {
        dimension: { longName: 'Age' },
        value: { id: '20', description: '20 - 30' }
      },
      {
        dimension: { longName: 'Browser' },
        value: { id: 'chrome', description: 'Chrome' }
      }
    ]
  },
  {
    searchKey: '20 20 - 30 firefox Firefox',
    dimensions: [
      {
        dimension: { longName: 'Age' },
        value: { id: '20', description: '20 - 30' }
      },
      {
        dimension: { longName: 'Browser' },
        value: { id: 'firefox', description: 'Firefox' }
      }
    ]
  }
]);

const SERIES_DIMENSIONS = A(AVAILABLE_SERIES_DATA[0].dimensions).mapBy('dimension');

module('Integration | Component | series selector', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setProperties({
      availableSeriesData: AVAILABLE_SERIES_DATA,
      seriesDimensions: SERIES_DIMENSIONS,
      addSeries: () => null
    });
  });

  test('It renders correctly', async function(assert) {
    assert.expect(2);

    await render(TEMPLATE);
    await click('.add-series .btn-add');

    let header = findAll('.table-header .table-cell:not(.table-cell--icon)').map(el => el.textContent.trim());

    assert.deepEqual(header, ['Age', 'Browser'], 'table header is correctly displayed based on seriesDimensions');

    let body = findAll('.table-body .table-cell:not(.table-cell--icon)').map(el => el.textContent.trim());

    assert.deepEqual(
      body,
      [
        '10 - 20 (10)',
        'Safari Mobile (safari_mobile)',
        '20 - 30 (20)',
        'Chrome (chrome)',
        '20 - 30 (20)',
        'Firefox (firefox)'
      ],
      'table body is correctly displayed based on availableSeriesData'
    );
  });

  test('No available series', async function(assert) {
    assert.expect(1);

    this.set('availableSeriesData', []);

    this.set('addSeries', () => {
      assert.ok(false, 'clicking on the message should not trigger the action');
    });

    await render(TEMPLATE);
    await click('.add-series .btn-add');

    let body = findAll('.table-body .table-cell').map(el => el.textContent.trim());

    assert.deepEqual(body, ['No Other Series Available'], 'table body displays messages that no series are available');

    // Try to click msg
    await click('.table-body .table-cell');
  });

  test('disableAdd', async function(assert) {
    assert.expect(2);

    await render(TEMPLATE);

    assert
      .dom('.add-series .pick-value')
      .doesNotHaveClass('disableClick', 'when enabled "Add Series" button is not disabled"');

    this.set('disableAdd', true);

    assert.dom('.add-series .pick-value').hasClass('disableClick', 'when disabled "Add Series" button is disabled"');
  });

  test('addSeries Action', async function(assert) {
    assert.expect(1);

    this.set('addSeries', series => {
      assert.deepEqual(series, AVAILABLE_SERIES_DATA[0], 'clicking on a table body row sends the selected series');
    });

    await render(TEMPLATE);
    await click('.add-series .btn-add');
    await click('.table-body .table-row');
  });

  test('Searching', async function(assert) {
    assert.expect(4);

    await render(TEMPLATE);
    await click('.add-series .btn-add');

    assert.dom('.search.chart-series-14').isVisible('search bar is visible and has correct chart-series class');

    /* == Search "30" == */
    await fillIn('.search input', '30');

    let body = findAll('.table-body .table-cell:not(.table-cell--icon)').map(el => el.textContent.trim());

    assert.deepEqual(
      body,
      ['20 - 30 (20)', 'Chrome (chrome)', '20 - 30 (20)', 'Firefox (firefox)'],
      'table body only shows rows that match search term'
    );

    /* == Search "Opera" == */
    await fillIn('.search input', 'Opera');

    assert.dom('.table-body .table-cell').doesNotExist('table body is empty when search has no matching results');

    assert.dom('.no-match').isVisible('no match message is displayed when search has no matching results');
  });
});
