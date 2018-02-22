import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | navi-report - metric parameters');

test('adding and removing metrics', function(assert) {
  assert.expect(6);

  visit('/reports/1/view');

  andThen(() => {
    assert.ok(find('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .metric-config').length,
      'Revenue metric has the metric config icon since it has parameters');
  });

  //adding a metric with default params
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .grouped-list__item-label');
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .metric-config__trigger-icon');

  andThen(() => {
    assert.equal(find('.metric-config__dropdown-container .navi-list-selector__show-link').text().trim(),
      'Show Selected (1)',
      'The Show Selected link has the correct number of selected metric parameters shown');
  });

  click('.metric-config__dropdown-container .navi-list-selector__show-link');
  andThen(() => {
    assert.deepEqual(find('.metric-config__dropdown-container .grouped-list__item').toArray().map(el => $(el).text().trim()),
      [ 'Dollars (USD)' ],
      'When show selected is clicked only the default parameter for the metric is shown');
  });

  //adding another param for the same metric
  click('.metric-config__dropdown-container .navi-list-selector__show-link');
  click('.metric-config__dropdown-container .grouped-list__item:contains(Euro) .grouped-list__item-label');
  click('.metric-config__dropdown-container .navi-list-selector__show-link');

  andThen(() => {
    assert.deepEqual(find('.metric-config__dropdown-container .grouped-list__item').toArray().map(el => $(el).text().trim()),
      [ 'Dollars (USD)', 'Euro (EUR)' ],
      'When show selected is clicked all the selected parameters for the metric are shown');
  });

  //closing and reopening dropdown does not affect the selected params
  click('.metric-config__dropdown-container .metric-config__done-btn');
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .metric-config__trigger-icon');
  click('.metric-config__dropdown-container .navi-list-selector__show-link');

  andThen(() => {
    assert.deepEqual(find('.metric-config__dropdown-container .grouped-list__item').toArray().map(el => $(el).text().trim()),
      [ 'Dollars (USD)', 'Euro (EUR)' ],
      'When show selected is clicked all the selected parameters for the metric are shown');
  });

  //removing the metric
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .grouped-list__item-label');
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .metric-config__trigger-icon');

  andThen(() => {
    assert.equal(find('.metric-config__dropdown-container .navi-list-selector__show-link').text().trim(),
      'Show Selected (0)',
      'removing the metric removes all selected params');
  });
});
