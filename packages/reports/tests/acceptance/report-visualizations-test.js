import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | navi-report - report visualizations', {
  afterEach() {
    server.shutdown();
  }
});

test('filter changes line chart series', function(assert) {
  assert.expect(2);

  visit('/reports/1/view');

  andThen(() => {
    assert.deepEqual(
      find('.c3-legend-item')
        .toArray()
        .map(el => el.textContent.trim()),
      ['Property 1', 'Property 2', 'Property 3'],
      'Without filters, three series are shown in the chart'
    );
  });

  /* == Add filter == */
  andThen(() => {
    //get property groupedlist item
    let property = find('.checkbox-selector--dimension .grouped-list__item')
      .toArray()
      .find(el => {
        return el.textContent.trim() === 'Property';
      });

    click('.checkbox-selector__filter', property);
    selectChoose('.filter-values--dimension-select', '.ember-power-select-option', 0);
    click('.navi-report__run-btn');

    andThen(() => {
      assert.deepEqual(
        find('.c3-legend-item')
          .toArray()
          .map(el => el.textContent.trim()),
        ['Property 1'],
        'With filter, only the filtered series is shown'
      );
    });
  });
});

test('Table column sort', function(assert) {
  assert.expect(38);

  visit('/reports/2/view');

  //table is not sorted
  andThen(() => {
    assert.notOk(
      find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--desc'),
      'Metric is not desc sorted'
    );

    assert.notOk(
      find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--asc'),
      'Metric is not asc sorted'
    );
  });

  //sort by first metric desc
  click('.table-header-cell.metric:first .navi-table-sort-icon');
  andThen(() => {
    assert.ok(
      find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--desc'),
      'Metric is sorted desc on first sort click'
    );

    assert.notOk(
      find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--asc'),
      'Metric is not sorted asc on first sort click'
    );
  });

  //sort by first metric asc
  click('.table-header-cell.metric:first .navi-table-sort-icon');
  andThen(() => {
    assert.ok(
      find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--asc'),
      'Metric is sorted asc on second sort click'
    );

    assert.notOk(
      find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--desc'),
      'Metric is not sorted desc on second sort click'
    );
  });

  //remove sort by first metric
  click('.table-header-cell.metric:first .navi-table-sort-icon');
  andThen(() => {
    assert.notOk(
      find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--desc'),
      'Metric is not sorted desc after third sort click'
    );

    assert.notOk(
      find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--asc'),
      'Metric is not sorted asc after third sort click'
    );

    assert.ok(
      find('.table-header-cell.dateTime:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--desc'),
      'Datetime is sorted desc by default'
    );
  });

  //sort by dateTime desc
  click('.table-header-cell.dateTime:first .navi-table-sort-icon');
  andThen(() => {
    assert.ok(
      find('.table-header-cell.dateTime:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--asc'),
      'Datetime is sorted asc after first sort click'
    );
  });

  //sort by dateTime asc
  click('.table-header-cell.dateTime:first .navi-table-sort-icon');
  andThen(() => {
    assert.ok(
      find('.table-header-cell.dateTime:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--desc'),
      'Datetime is sorted desc after second sort click'
    );
  });

  //remove sort by dateTime
  click('.table-header-cell.dateTime:first .navi-table-sort-icon');

  //add a parameterized metric with a couple of parameters and run the report
  click('.report-builder__metric-selector .grouped-list__item:contains(Platform Revenue) .grouped-list__item-label');
  click('.metric-config__dropdown-container .grouped-list__item:contains(Euro) .grouped-list__item-label');
  click('.navi-report__run-btn');

  //test that the table is not sorted
  andThen(() => {
    //first parameter
    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--desc'
      ),
      'Metric with first parameter is not sorted desc'
    );

    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--asc'
      ),
      'Metric with first parameter is not sorted asc'
    );

    //second parameter
    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--desc'
      ),
      'Metric with second parameter is not sorted desc'
    );

    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--asc'
      ),
      'Metric with second parameter is not sorted asc'
    );
  });

  //sort by first parameter desc
  click('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon');
  andThen(() => {
    //first parameter
    assert.ok(
      find('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--desc'
      ),
      'Metric with first parameter is sorted desc after first sort click'
    );

    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--asc'
      ),
      'Metric with first parameter is not sorted asc after first sort click'
    );

    //second parameter
    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--desc'
      ),
      'Metric with second parameter is not sorted desc after first sort click'
    );

    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--asc'
      ),
      'Metric with second parameter is not sorted asc after first sort click'
    );
  });

  //test API query and close the modal
  click('.navi-report__copy-api-btn .get-api__btn');
  andThen(() => {
    assert.ok(
      find('.navi-modal__input')
        .val()
        .includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DUSD)%7Cdesc'),
      'API query contains sorting by metric with first parameter desc after first sort click'
    );

    assert.notOk(
      find('.navi-modal__input')
        .val()
        .includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DEUR)'),
      'API query does not contain sorting by metric with second parameter after first sort click'
    );
  });
  click('.navi-modal__close');

  //sort by first parameter asc
  click('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon');
  andThen(() => {
    //first parameter
    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--desc'
      ),
      'Metric with first parameter is not sorted desc after second sort click'
    );

    assert.ok(
      find('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--asc'
      ),
      'Metric with first parameter is sorted asc after second sort click'
    );

    //second parameter
    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--desc'
      ),
      'Metric with second parameter is not sorted desc after second sort click'
    );

    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--asc'
      ),
      'Metric with second parameter is not sorted asc after second sort click'
    );
  });

  //test API query and close the modal
  click('.navi-report__copy-api-btn .get-api__btn');
  andThen(() => {
    assert.ok(
      find('.navi-modal__input')
        .val()
        .includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DUSD)%7Casc'),
      'API query contains sorting by metric with first parameter asc after second sort click'
    );

    assert.notOk(
      find('.navi-modal__input')
        .val()
        .includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DEUR)'),
      'API query does not contain sorting by metric with second parameter after second sort click'
    );
  });
  click('.navi-modal__close');

  //remove sort by first parameter
  click('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon');
  andThen(() => {
    //first parameter
    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--desc'
      ),
      'Metric with first parameter is not sorted desc after third sort click'
    );

    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--asc'
      ),
      'Metric with first parameter is not sorted asc after third sort click'
    );

    //second parameter
    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--desc'
      ),
      'Metric with second parameter is not sorted desc after third sort click'
    );

    assert.notOk(
      find('.table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--asc'
      ),
      'Metric with second parameter is not sorted asc after third sort click'
    );
  });

  //test API query and close the modal
  click('.navi-report__copy-api-btn .get-api__btn');
  andThen(() => {
    assert.notOk(
      find('.navi-modal__input')
        .val()
        .includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DUSD)'),
      'API query does not contain sorting by metric with first parameter after third sort click'
    );

    assert.notOk(
      find('.navi-modal__input')
        .val()
        .includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DEUR)'),
      'API query does not contain sorting by metric with second parameter after third sort click'
    );
  });
  click('.navi-modal__close');

  //sort by both parameters
  click('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon');
  click('.table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon');
  andThen(() => {
    //first parameter
    assert.ok(
      find('.table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--desc'
      ),
      'Metric with first parameter is sorted desc after sorting by both parameters'
    );

    //second parameter
    assert.ok(
      find('.table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon').hasClass(
        'navi-table-sort-icon--desc'
      ),
      'Metric with first parameter is sorted desc after sorting by both parameters'
    );
  });

  //remove the metric
  click('.report-builder__metric-selector .grouped-list__item:contains(Platform Revenue) .grouped-list__item-label');

  //test API query and close the modal
  click('.navi-report__copy-api-btn .get-api__btn');
  andThen(() => {
    assert.notOk(
      find('.navi-modal__input')
        .val()
        .includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DUSD)'),
      'API query does not contain sorting by metric with first parameter after removing the metric'
    );

    assert.notOk(
      find('.navi-modal__input')
        .val()
        .includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DEUR)'),
      'API query does not contain sorting by metric with second parameter after removing the metric'
    );
  });
  click('.navi-modal__close');

  //verify that the table visualization is still shown and not an error
  click('.navi-report__run-btn');
  andThen(() => {
    assert.ok(!!find('.table-widget').length, 'table visualization is still shown');
  });
});
