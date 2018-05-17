import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | navi-report - report visualizations');

test('filter changes line chart series', function(assert) {
  assert.expect(2);

  visit('/reports/1/view');

  andThen(() => {
    assert.deepEqual(find('.c3-legend-item').toArray().map(el => el.textContent.trim()),
      [ 'Property 1', 'Property 2', 'Property 3' ],
      'Without filters, three series are shown in the chart');
  });

  /* == Add filter == */
  andThen(() => {
    //get property groupedlist item
    let property = find('.checkbox-selector--dimension .grouped-list__item').toArray().find(el => {
      return el.textContent.trim() === 'Property'
    });

    click('.checkbox-selector__filter', property);
    selectChoose('.filter-values--dimension-select', '.ember-power-select-option', 0);
    click('.navi-report__run-btn');

    andThen(() => {
      assert.deepEqual(find('.c3-legend-item').toArray().map(el => el.textContent.trim()),
        [ 'Property 1' ],
        'With filter, only the filtered series is shown');
    });
  });
});

test('Table column sort', function(assert) {
  assert.expect(11);

  visit('/reports/2/view');
  andThen(() => {
    assert.notOk(find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--desc'),
      'Metric is not desc sorted');
    assert.notOk(find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--asc'),
      'Metric is not asc sorted');
    click('.table-header-cell.metric:first .navi-table-sort-icon');
  });

  andThen(() => {
    assert.ok(find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--desc'),
      'Metric is sorted desc on first sort click');
    assert.notOk(find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--asc'),
      'Metric is not sorted asc on first sort click');
    click('.table-header-cell.metric:first .navi-table-sort-icon');  
  });

  andThen(() => {
    assert.ok(find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--asc'),
      'Metric is sorted asc on second sort click');
    assert.notOk(find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--desc'),
      'Metric is not sorted desc on second sort click');
    click('.table-header-cell.metric:first .navi-table-sort-icon');  
  });

  andThen(() => {
    assert.notOk(find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--desc'),
      'Metric is not sorted desc after third sort click');
    assert.notOk(find('.table-header-cell.metric:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--asc'),
      'Metric is not sorted asc after third sort click');

    assert.ok(find('.table-header-cell.dateTime:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--desc'),
      'Datetime is sorted desc by default');
    click('.table-header-cell.dateTime:first .navi-table-sort-icon');  
  });

  andThen(() => {
    assert.ok(find('.table-header-cell.dateTime:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--asc'),
      'Datetime is sorted asc after first sort click');
    click('.table-header-cell.dateTime:first .navi-table-sort-icon');  
  });

  andThen(() => {
    assert.ok(find('.table-header-cell.dateTime:first .navi-table-sort-icon').hasClass('navi-table-sort-icon--desc'),
      'Datetime is sorted desc after second sort click');
    click('.table-header-cell.dateTime:first .navi-table-sort-icon');  
  });
});
