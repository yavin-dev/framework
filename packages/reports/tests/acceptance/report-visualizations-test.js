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
