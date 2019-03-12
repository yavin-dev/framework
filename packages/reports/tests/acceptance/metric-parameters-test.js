import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | navi-report - metric parameters', {
  afterEach() {
    server.shutdown();
  }
});

test('adding and removing metrics', function(assert) {
  assert.expect(6);

  visit('/reports/1/view');

  andThen(() => {
    assert.ok(
      find('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .metric-config').length,
      'Revenue metric has the metric config icon since it has parameters'
    );
  });

  //adding a metric with default params
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .grouped-list__item-label');

  andThen(() => {
    assert.equal(
      find('.metric-config__dropdown-container .navi-list-selector__show-link')
        .text()
        .trim(),
      'Show Selected (1)',
      'The Show Selected link has the correct number of selected metric parameters shown'
    );
  });

  click('.metric-config__dropdown-container .navi-list-selector__show-link');
  andThen(() => {
    assert.deepEqual(
      find('.metric-config__dropdown-container .grouped-list__item')
        .toArray()
        .map(el =>
          find(el)
            .text()
            .trim()
        ),
      ['Dollars (USD)'],
      'When show selected is clicked only the default parameter for the metric is shown'
    );
  });

  //adding another param for the same metric
  click('.metric-config__dropdown-container .navi-list-selector__show-link');
  click('.metric-config__dropdown-container .grouped-list__item:contains(Euro) .grouped-list__item-label');
  click('.metric-config__dropdown-container .navi-list-selector__show-link');

  andThen(() => {
    assert.deepEqual(
      find('.metric-config__dropdown-container .grouped-list__item')
        .toArray()
        .map(el =>
          find(el)
            .text()
            .trim()
        ),
      ['Dollars (USD)', 'Euro (EUR)'],
      'When show selected is clicked all the selected parameters for the metric are shown'
    );
  });

  //closing and reopening dropdown does not affect the selected params
  click('.metric-config__dropdown-container .metric-config__done-btn');
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .metric-config__trigger-icon');
  click('.metric-config__dropdown-container .navi-list-selector__show-link');

  andThen(() => {
    assert.deepEqual(
      find('.metric-config__dropdown-container .grouped-list__item')
        .toArray()
        .map(el =>
          find(el)
            .text()
            .trim()
        ),
      ['Dollars (USD)', 'Euro (EUR)'],
      'When show selected is clicked all the selected parameters for the metric are shown'
    );
  });

  //close the metric config
  click('.metric-config__done-btn');

  //removing the metric
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .grouped-list__item-label');
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .metric-config__trigger-icon');

  andThen(() => {
    assert.equal(
      find('.metric-config__dropdown-container .navi-list-selector__show-link')
        .text()
        .trim(),
      'Show Selected (0)',
      'removing the metric removes all selected params'
    );
  });
});

test('auto open metric config', function(assert) {
  assert.expect(3);

  visit('/reports/1/view');
  //add revenue (metric with params)
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .grouped-list__item-label');
  andThen(() => {
    assert.ok(
      find('.metric-config__dropdown-container').is(':visible'),
      'The metric config dropdown container is opened when a metric with parameters is selected'
    );
  });

  //close the config dropdown
  click('.metric-config__dropdown-container .metric-config__done-btn');
  andThen(() => {
    assert.notOk(
      find('.metric-config__dropdown-container').is(':visible'),
      'The metric config dropdown container is closed when the done button is clicked'
    );
  });

  //remove revenue
  click('.grouped-list__item:contains(Revenue) .grouped-list__item-label');
  andThen(() => {
    assert.notOk(
      find('.metric-config__dropdown-container').is(':visible'),
      'The metric config dropdown container remains closed when the metric is removed'
    );
  });
});

test('metric config - filter parameter', function(assert) {
  assert.expect(2);

  visit('/reports/1/view');
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .grouped-list__item-label');
  click('.metric-config__dropdown-container .grouped-list__item:contains(EUR) .metric-config__filter-icon');
  click('.metric-config__dropdown-container .navi-list-selector__show-link');

  andThen(() => {
    assert.deepEqual(
      find('.metric-config__dropdown-container .grouped-list__item')
        .toArray()
        .map(el => el.textContent.trim()),
      ['Dollars (USD)', 'Euro (EUR)'],
      'The filtered parameter is also selected'
    );

    assert.ok(find('.filter-builder__subject:contains(EUR)').length, 'The parameterized metric is added as a filter');
  });
});

test('metric filter config', function(assert) {
  assert.expect(4);

  visit('/reports/1/view');
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .grouped-list__item-label');
  click('.metric-config__dropdown-container .grouped-list__item:contains(AUD) .grouped-list__item-label');
  click('.metric-config__dropdown-container .grouped-list__item:contains(CAD) .grouped-list__item-label');
  click('.metric-config__dropdown-container .grouped-list__item:contains(EUR) .metric-config__filter-icon');
  click('.metric-config__dropdown-container .navi-list-selector__show-link');

  andThen(() => {
    assert.ok(
      find('.filter-builder__subject:contains(EUR) .metric-filter-config__trigger-icon').length,
      'The metric config trigger icon is rendered next to the parameterized filter'
    );
  });

  click('.filter-builder__subject:contains(EUR) .metric-filter-config__trigger-icon');
  andThen(() => {
    assert.deepEqual(
      find('.metric-filter-config__item')
        .toArray()
        .map(el => el.textContent.trim()),
      ['USD', 'AUD', 'CAD'],
      'Only the non filtered parameters from the list of selected metrics are shown in the filter config list'
    );
  });

  click('.metric-filter-config__item:contains(USD)');
  andThen(() => {
    assert.deepEqual(
      find('.filter-builder__subject:contains(Revenue)')
        .toArray()
        .map(el => el.textContent.trim()),
      ['Platform Revenue (USD)'],
      'The Euro parameter is updated to USD'
    );
  });

  click('.filter-builder__subject:contains(USD) .metric-filter-config__trigger-icon');
  andThen(() => {
    assert.deepEqual(
      find('.metric-filter-config__item')
        .toArray()
        .map(el => el.textContent.trim()),
      ['AUD', 'CAD', 'EUR'],
      'the parameter list in the metric filter config is updated to hold the unfiltered parameters'
    );
  });
});

test('metric selector filter action for parameterized metrics', function(assert) {
  assert.expect(4);

  visit('/reports/1/view');
  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .grouped-list__item-label');
  click('.metric-config__dropdown-container .grouped-list__item:contains(AUD) .grouped-list__item-label');
  click('.metric-config__dropdown-container .metric-config__done-btn');

  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .metric-selector__filter');
  andThen(() => {
    assert.equal(
      find('.filter-builder__subject:contains(Revenue)').length,
      1,
      'The metric filter adds a single filter of type revenue'
    );
  });

  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .metric-selector__filter');
  andThen(() => {
    assert.equal(
      find('.filter-builder__subject:contains(Revenue)').length,
      2,
      'Clicking on the filter adds a another filter of type revenue'
    );

    assert.deepEqual(
      find('.filter-builder__subject:contains(Revenue)')
        .toArray()
        .map(el => el.textContent.trim()),
      ['Platform Revenue (AUD)', 'Platform Revenue (USD)'],
      'Both the selected metrics have been added as filters'
    );
  });

  click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .metric-selector__filter');
  andThen(() => {
    assert.equal(
      find('.filter-builder__subject:contains(Revenue)').length,
      0,
      'After adding all the request parameters for a metric, clicking an additional time removes all filters for the metric'
    );
  });
});

test('old reports still allow you to choose parameters', async function(assert) {
  assert.expect(1);
  await visit('/reports/11/view');

  await click('.report-builder__metric-selector .navi-list-selector__show-link');
  await click('.report-builder__metric-selector .grouped-list__item:contains(Revenue) .metric-config > div');

  const options = find('.metric-config__dropdown-container .grouped-list__item').toArray();
  assert.ok(options.length > 0, 'Metric options should render');
});
