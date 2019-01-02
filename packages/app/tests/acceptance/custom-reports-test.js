import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'navi-app/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | custom reports');

test('Viewing saved reports', function(assert) {
  assert.expect(3);

  visit('/reports');
  andThen(() => {
    assert.ok(
      Ember.isPresent(find('.navi-reports-index .navi-collection table')),
      'Table containing list of custom reports is visible'
    );

    let firstReport = '.navi-collection tbody td:first a',
      reportTitle = find(firstReport)
        .text()
        .trim();

    click(firstReport);
    andThen(() => {
      assert.ok(
        currentURL().match(/^\/reports\/\d+\/view$/),
        `On clicking the "${reportTitle}" link, user is brought to the appropriate report view`
      );

      assert.equal(
        find('.navi-report__title')
          .text()
          .trim(),
        reportTitle,
        `Report title contains text "${reportTitle}" as expected`
      );
    });
  });
});

test('Accessing Report Builder', function(assert) {
  assert.expect(2);

  visit('/reports');
  andThen(() => {
    click('a:contains("New Report")');
    andThen(() => {
      assert.ok(
        currentURL().match(
          /^\/reports\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/edit/
        ),
        'Clicking "New Report" button brings the user to the report builder'
      );

      assert.ok(Ember.isPresent(find('.report-builder')), 'Custom report builder is visible');
    });
  });
});
